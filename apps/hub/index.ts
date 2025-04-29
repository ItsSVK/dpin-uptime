import { randomUUIDv7, type ServerWebSocket } from 'bun';
import type { IncomingMessage, SignupIncomingMessage } from 'common/types';
import { MessageType } from 'common/types';
import { prismaClient } from 'db/client';
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import nacl_util from 'tweetnacl-util';
import { Region } from '@prisma/client';
import type { Validator } from '@prisma/client';
import { WebsiteStatus, Prisma, UptimePeriod } from '@prisma/client';
import { startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { ValidatorManager } from './utils/validatorSelection';
import { mapToRegion, isLocalhost } from './utils/region';

const validatorManager = new ValidatorManager();
const CALLBACKS: { [callbackId: string]: (data: IncomingMessage) => void } = {};
const COST_PER_VALIDATION = 100; // in lamports
const VALIDATION_TIMEOUT = 10000; // 10 seconds

Bun.serve({
  fetch(req, server) {
    if (server.upgrade(req)) {
      return;
    }
    return new Response('Upgrade failed', { status: 500 });
  },
  port: 8081,
  websocket: {
    message(ws: ServerWebSocket<unknown>, message: string) {
      const data: IncomingMessage = JSON.parse(message);

      if (data.type === MessageType.SIGNUP) {
        console.log('Validator Connected: ', data.data.publicKey);
        handleSignupMessage(ws, data);
      } else if (data.type === MessageType.VALIDATE) {
        CALLBACKS[data.data.callbackId](data);
        delete CALLBACKS[data.data.callbackId];
      } else if (data.type === MessageType.HEARTBEAT) {
        // Find validator by socket and update its heartbeat
        for (const group of validatorManager.getAllValidators()) {
          if (group.socket === ws) {
            validatorManager.updateHeartbeat(group.validatorId);
            break;
          }
        }
      }
    },
    close(ws: ServerWebSocket<unknown>) {
      // Find and remove the validator by socket
      for (const validator of validatorManager.getAllValidators()) {
        if (validator.socket === ws) {
          validatorManager.removeValidator(validator.validatorId);
          console.log('Validator Disconnected: ', validator.publicKey);
          (async () => {
            await prismaClient.validator.update({
              where: { id: validator.validatorId },
              data: {
                isActive: false,
              },
            });
          })();
          break;
        }
      }
    },
  },
});

async function signupHandler(
  ws: ServerWebSocket<unknown>,
  {
    publicKey,
    callbackId,
    ip,
    country,
    city,
    latitude,
    longitude,
    region,
  }: SignupIncomingMessage
) {
  let validatorDb: Validator | null = null;

  const mappedRegion =
    typeof region === 'string'
      ? mapToRegion(region, latitude, longitude)
      : region;

  validatorDb = await prismaClient.validator.findFirst({
    where: {
      publicKey,
    },
    include: {
      ticks: true,
    },
  });

  if (!validatorDb) {
    validatorDb = await prismaClient.validator.create({
      data: {
        ip,
        publicKey,
        country,
        city,
        latitude,
        longitude,
        region: mappedRegion,
        ticks: { create: [] },
      },
      include: {
        ticks: true,
      },
    });
  } else {
    await prismaClient.validator.update({
      where: { id: validatorDb.id },
      data: {
        ip,
        country,
        city,
        latitude,
        longitude,
        region: mappedRegion,
        isActive: true,
      },
    });
  }

  if (validatorDb) {
    ws.send(
      JSON.stringify({
        type: MessageType.SIGNUP,
        data: {
          validatorId: validatorDb.id,
          callbackId,
        },
      })
    );

    validatorManager.addValidator(
      {
        validatorId: validatorDb.id,
        socket: ws,
        publicKey: validatorDb.publicKey,
        trustScore: validatorDb.trustScore ?? 0,
      },
      mappedRegion
    );
    return;
  }
}

async function addSeconds(date: Date | null, seconds: number): Promise<Date> {
  if (!date) {
    return new Date();
  }
  return new Date(date.getTime() + seconds * 1000);
}

async function verifyMessage(
  message: string,
  publicKey: string,
  signature: string
) {
  const messageBytes = nacl_util.decodeUTF8(message);
  const result = nacl.sign.detached.verify(
    messageBytes,
    new Uint8Array(JSON.parse(signature)),
    new PublicKey(publicKey).toBytes()
  );

  return result;
}

async function getGeoData(ip: string) {
  // For localhost/development environments, return a default region
  if (isLocalhost(ip)) {
    return {
      country: 'Development',
      city: 'Local',
      region: Region.INDIA,
      latitude: 0,
      longitude: 0,
      ip: ip,
    };
  }

  // Try primary provider (ipapi.co)
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();

    if (!data.error) {
      return {
        country: data.country_name,
        city: data.city,
        region: mapToRegion(data.region, data.latitude, data.longitude),
        latitude: data.latitude,
        longitude: data.longitude,
        ip: ip,
      };
    }
    throw new Error('Failed to get location data from primary provider');
  } catch (primaryError) {
    console.error('Error with primary geo provider:', primaryError);

    // Try secondary provider (geojs.io)
    try {
      const response = await fetch(`https://get.geojs.io/v1/ip/geo/${ip}.json`);
      const data = await response.json();

      if (data.latitude === 'nil') {
        throw new Error('Failed to get location data from secondary provider');
      }

      const lat = parseFloat(data.latitude);
      const lng = parseFloat(data.longitude);

      return {
        country: data.country,
        city: data.city,
        region: mapToRegion(data.region, lat, lng),
        latitude: lat,
        longitude: lng,
        ip: ip,
      };
    } catch (secondaryError) {
      console.error('Error with secondary geo provider:', secondaryError);

      // Return default values if both providers fail
      return {
        country: 'Unknown',
        city: 'Unknown',
        region: Region.INDIA,
        latitude: 0,
        longitude: 0,
        ip: ip,
      };
    }
  }
}

interface WebsiteTick {
  status: WebsiteStatus;
  total: number | null;
  createdAt: Date;
}

interface UptimeHistory {
  uptimePercentage: number;
  averageResponse: number | null;
  incidents: number;
  downtime: number;
  period: UptimePeriod;
  startDate: Date;
  endDate: Date;
  totalIncidents: number;
  totalDowntime: number;
}

async function calculateHistoricalUptime(
  tx: Prisma.TransactionClient,
  websiteId: string,
  period: UptimePeriod,
  startDate: Date
): Promise<UptimeHistory | null> {
  const endDate = new Date(startDate);
  let durationInHours: number;

  switch (period) {
    case UptimePeriod.DAILY:
      endDate.setDate(endDate.getDate() + 1);
      durationInHours = 24;
      break;
    case UptimePeriod.WEEKLY:
      endDate.setDate(endDate.getDate() + 7);
      durationInHours = 168;
      break;
    case UptimePeriod.MONTHLY:
      endDate.setMonth(endDate.getMonth() + 1);
      durationInHours = endDate.getDate() * 24;
      break;
  }

  const ticks = await tx.websiteTick.findMany({
    where: {
      websiteId,
      createdAt: {
        gte: startDate,
        lt: endDate,
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  if (ticks.length === 0) return null;

  const totalTicks = ticks.length;
  const upTicks = ticks.filter(
    (tick: WebsiteTick) => tick.status === WebsiteStatus.ONLINE
  ).length;
  const uptimePercentage = (upTicks / totalTicks) * 100;

  const validResponseTimes = ticks.filter(
    (tick: WebsiteTick) => tick.total != null
  );
  const averageResponse =
    validResponseTimes.length > 0
      ? validResponseTimes.reduce(
          (sum: number, tick: WebsiteTick) => sum + (tick.total || 0),
          0
        ) / validResponseTimes.length
      : null;

  const incidents = ticks.reduce(
    (acc: number, tick: WebsiteTick, index: number) => {
      if (
        tick.status === WebsiteStatus.OFFLINE &&
        (index === 0 || ticks[index - 1].status !== WebsiteStatus.OFFLINE)
      ) {
        acc++;
      }
      return acc;
    },
    0
  );

  const downtime = ticks.reduce((acc: number, tick: WebsiteTick) => {
    if (tick.status === WebsiteStatus.OFFLINE) {
      acc += 60; // Assuming 60-second check frequency
    }
    return acc;
  }, 0);

  return {
    period,
    startDate,
    endDate,
    uptimePercentage,
    averageResponse,
    incidents,
    downtime,
    totalIncidents: incidents,
    totalDowntime: downtime,
  };
}

async function updateHistoricalData(
  tx: Prisma.TransactionClient,
  websiteId: string
): Promise<void> {
  const daily = await calculateHistoricalUptime(
    tx,
    websiteId,
    UptimePeriod.DAILY,
    startOfDay(new Date())
  );
  const weekly = await calculateHistoricalUptime(
    tx,
    websiteId,
    UptimePeriod.WEEKLY,
    startOfWeek(new Date())
  );
  const monthly = await calculateHistoricalUptime(
    tx,
    websiteId,
    UptimePeriod.MONTHLY,
    startOfMonth(new Date())
  );

  // Update or create historical uptime records using upsert
  await tx.uptimeHistory.upsert({
    where: {
      websiteId_period_startDate: {
        websiteId,
        period: UptimePeriod.DAILY,
        startDate: startOfDay(new Date()),
      },
    },
    create: {
      websiteId,
      period: UptimePeriod.DAILY,
      startDate: startOfDay(new Date()),
      endDate: new Date(),
      uptimePercentage: daily?.uptimePercentage ?? 0,
      averageResponse: daily?.averageResponse ?? null,
      totalIncidents: daily?.totalIncidents ?? 0,
      totalDowntime: daily?.totalDowntime ?? 0,
    },
    update: {
      endDate: new Date(),
      uptimePercentage: daily?.uptimePercentage ?? 0,
      averageResponse: daily?.averageResponse ?? null,
      totalIncidents: daily?.totalIncidents ?? 0,
      totalDowntime: daily?.totalDowntime ?? 0,
    },
  });

  if (weekly) {
    await tx.uptimeHistory.upsert({
      where: {
        websiteId_period_startDate: {
          websiteId,
          period: UptimePeriod.WEEKLY,
          startDate: startOfWeek(new Date()),
        },
      },
      create: {
        websiteId,
        period: UptimePeriod.WEEKLY,
        startDate: startOfWeek(new Date()),
        endDate: new Date(),
        uptimePercentage: weekly.uptimePercentage,
        averageResponse: weekly.averageResponse,
        totalIncidents: weekly.totalIncidents,
        totalDowntime: weekly.totalDowntime,
      },
      update: {
        endDate: new Date(),
        uptimePercentage: weekly.uptimePercentage,
        averageResponse: weekly.averageResponse,
        totalIncidents: weekly.totalIncidents,
        totalDowntime: weekly.totalDowntime,
      },
    });
  }

  if (monthly) {
    await tx.uptimeHistory.upsert({
      where: {
        websiteId_period_startDate: {
          websiteId,
          period: UptimePeriod.MONTHLY,
          startDate: startOfMonth(new Date()),
        },
      },
      create: {
        websiteId,
        period: UptimePeriod.MONTHLY,
        startDate: startOfMonth(new Date()),
        endDate: new Date(),
        uptimePercentage: monthly.uptimePercentage,
        averageResponse: monthly.averageResponse,
        totalIncidents: monthly.totalIncidents,
        totalDowntime: monthly.totalDowntime,
      },
      update: {
        endDate: new Date(),
        uptimePercentage: monthly.uptimePercentage,
        averageResponse: monthly.averageResponse,
        totalIncidents: monthly.totalIncidents,
        totalDowntime: monthly.totalDowntime,
      },
    });
  }
}

async function validateWebsite(
  website: any,
  validator: any,
  callbackId: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      delete CALLBACKS[callbackId];
      reject(new Error('Validation timeout'));
    }, VALIDATION_TIMEOUT);

    CALLBACKS[callbackId] = async (data: IncomingMessage) => {
      clearTimeout(timeoutId);
      if (data.type === MessageType.VALIDATE) {
        resolve(data);
      } else {
        reject(new Error('Invalid response type'));
      }
    };

    validator.socket.send(
      JSON.stringify({
        type: MessageType.VALIDATE,
        data: {
          url: website.url,
          callbackId,
          websiteId: website.id,
        },
      })
    );
  });
}

async function handleSignupMessage(
  ws: ServerWebSocket<unknown>,
  data: IncomingMessage
) {
  if (data.type !== MessageType.SIGNUP) return;

  const verified = await verifyMessage(
    `Signed message for ${data.data.callbackId}, ${data.data.publicKey}`,
    data.data.publicKey,
    data.data.signedMessage
  );
  if (verified) {
    const geoData = await getGeoData(ws.remoteAddress || '0.0.0.0');

    const signUpData: SignupIncomingMessage = {
      ...data.data,
      ip: geoData.ip,
      country: geoData.country,
      city: geoData.city,
      region: geoData.region,
      latitude: geoData.latitude,
      longitude: geoData.longitude,
    };

    await signupHandler(ws, signUpData);
  }
}

setInterval(async () => {
  const websitesToMonitor = await prismaClient.website.findMany({
    where: {
      isPaused: false,
    },
  });

  if (validatorManager.getActiveValidatorsCount() === 0) {
    return;
  }

  const websiteByFrequency = await Promise.all(
    websitesToMonitor.map(async website => {
      const nextCheck = await addSeconds(
        website.lastCheckedAt,
        website.checkFrequency
      );
      return {
        website,
        shouldCheck: nextCheck.getTime() <= new Date().getTime(),
      };
    })
  ).then(results => results.filter(r => r.shouldCheck).map(r => r.website));

  if (websiteByFrequency.length === 0) {
    return;
  }

  console.log(
    `Processing ${websiteByFrequency.length} websites for validation`
  );

  for (const website of websiteByFrequency) {
    if (website.isPaused) continue;

    // Redundant validation: select 3 validators per region
    const regions = Object.values(Region);
    let validatorsByRegion: { region: Region; validators: any[] }[] = regions
      .map(region => ({
        region,
        validators: validatorManager.selectMultipleValidators(region, 3),
      }))
      .filter(entry => entry.validators.length > 0);

    if (validatorsByRegion.length === 0) {
      console.log(`No available validators for website ${website.url}`);
      continue;
    }

    // If preferred region is specified, prioritize that region
    if (website.preferredRegion) {
      const preferred = validatorsByRegion.find(
        v => v.region === website.preferredRegion
      );
      if (preferred) {
        validatorsByRegion = [preferred];
      }
    }

    for (const { region, validators } of validatorsByRegion) {
      // Send validation requests to all selected validators
      const callbackMap: { [callbackId: string]: any } = {};
      const promises = validators.map(validator => {
        const callbackId = randomUUIDv7();
        callbackMap[callbackId] = validator;
        validatorManager.updateValidatorMetrics(validator.validatorId, true);
        return validateWebsite(website, validator, callbackId)
          .then(result => ({ result, callbackId, validator }))
          .catch(e => null);
      });

      // Wait for all responses (with timeout)
      const results = (await Promise.all(promises)).filter(
        (r): r is { result: any; callbackId: string; validator: any } =>
          r !== null && r.result && r.result.type === MessageType.VALIDATE
      );
      if (results.length === 0) continue;

      // Determine majority status (by statusCode or status logic)
      const statusArr = results.map(({ result }) => {
        const { error, total } = result.data;
        return error
          ? WebsiteStatus.OFFLINE
          : total > 1000
            ? WebsiteStatus.DEGRADED
            : WebsiteStatus.ONLINE;
      });
      const majorityStatus = statusArr
        .sort(
          (a, b) =>
            statusArr.filter(v => v === a).length -
            statusArr.filter(v => v === b).length
        )
        .pop();

      // Update trustScore for each validator
      for (const { result, callbackId, validator } of results) {
        const { error, total, signedMessage } = result.data;
        const status = error
          ? WebsiteStatus.OFFLINE
          : total > 1000
            ? WebsiteStatus.DEGRADED
            : WebsiteStatus.ONLINE;
        const verified = await verifyMessage(
          `Replying to ${callbackId}`,
          validator.publicKey,
          signedMessage
        );
        if (!verified) {
          console.error('Invalid signature from validator');
          continue;
        }
        // Tier and bonus logic
        const tier = getValidatorTier(validator.trustScore);
        const bonus = getTierBonus(tier);
        const payout = COST_PER_VALIDATION * (1 + bonus);
        // Update trustScore and pendingPayouts in DB
        await prismaClient.validator.update({
          where: { id: validator.validatorId },
          data: {
            trustScore: { increment: status === majorityStatus ? 1 : -1 },
            pendingPayouts: { increment: payout },
          },
        });
        // Update in-memory trustScore
        validator.trustScore += status === majorityStatus ? 1 : -1;
        // Only one tick per validator per website per round
        await prismaClient.websiteTick.create({
          data: {
            websiteId: website.id,
            validatorId: validator.validatorId,
            region,
            status,
            nameLookup: result.data.nameLookup,
            connection: result.data.connection,
            tlsHandshake: result.data.tlsHandshake,
            dataTransfer: result.data.dataTransfer,
            ttfb: result.data.ttfb,
            total: result.data.total,
            error: result.data.error,
            createdAt: new Date(),
          },
        });
      }
      // Optionally, update website status/uptime/average using majority result
      // ... (existing logic can be adapted here)
      // Update validator metrics (activeChecks)
      for (const validator of validators) {
        validatorManager.updateValidatorMetrics(validator.validatorId, false);
      }
    }
  }
}, 60 * 1000);

// Tier and bonus logic
function getValidatorTier(trustScore: number): 'New' | 'Trusted' | 'Expert' {
  if (trustScore >= 500) return 'Expert';
  if (trustScore >= 100) return 'Trusted';
  return 'New';
}

function getTierBonus(tier: 'New' | 'Trusted' | 'Expert'): number {
  if (tier === 'Expert') return 0.5;
  if (tier === 'Trusted') return 0.2;
  return 0;
}

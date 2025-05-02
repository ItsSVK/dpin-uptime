import { randomUUIDv7, type ServerWebSocket } from 'bun';
import type { IncomingMessage, SignupIncomingMessage } from 'common';
import {
  MessageType,
  REPLY_MESSAGE,
  VALIDATE_SIGNUP_MESSAGE,
  verifySignature,
} from 'common';
import { Region } from '@prisma/client';
import type { Validator } from '@prisma/client';
import { WebsiteStatus, Prisma, UptimePeriod } from '@prisma/client';
import { startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { ValidatorManager } from './utils/validatorSelection';
import { mapToRegion, isLocalhost } from './utils/region';
import { prismaClient } from 'db/client';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const validatorManager = new ValidatorManager();
const CALLBACKS: { [callbackId: string]: (data: IncomingMessage) => void } = {};
const COST_PER_VALIDATION = 100; // in lamports
const VALIDATION_TIMEOUT = 10000; // 10 seconds
const PLATFORM_FEE_PERCENT = 0.1; // 10% platform fee

type MyWebSocketData = {
  clientIp: string;
};

Bun.serve({
  fetch(req, server) {
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp =
      forwardedFor?.split(',')[0].trim() ??
      req.headers.get('cf-connecting-ip') ??
      '0.0.0.0';

    if (
      server.upgrade(req, {
        data: { clientIp } as MyWebSocketData,
      })
    ) {
      return;
    }

    return new Response('Upgrade failed', { status: 500 });
  },
  port: 8081,
  websocket: {
    open(ws) {
      console.log(
        'Validator connected from IP:',
        (ws.data as MyWebSocketData).clientIp
      );
    },
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
          console.log(
            `Validator Disconnected from IP ${
              (ws.data as MyWebSocketData).clientIp
            }:`,
            validator.publicKey
          );
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

  const verified = verifySignature(
    VALIDATE_SIGNUP_MESSAGE(data.data.callbackId, data.data.publicKey),
    data.data.signedMessage,
    data.data.publicKey
  );

  if (verified) {
    const ip = ws.remoteAddress || '0.0.0.0';

    const geoData = await getGeoData(formatIP(ip));

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
  const websitesToMonitorAll = await prismaClient.website.findMany({
    where: {
      isPaused: false,
    },
    include: {
      user: true,
    },
  });

  if (validatorManager.getActiveValidatorsCount() === 0) {
    return;
  }

  // filter out websites that are paused due to low balance
  const websitesToMonitor = websitesToMonitorAll.filter(
    website => website.user.currentBalance > 0.1 * LAMPORTS_PER_SOL
  );

  // make those websites paused which are not in the websitesToMonitor
  await prismaClient.website.updateMany({
    where: {
      id: { notIn: websitesToMonitor.map(website => website.id) },
    },
    data: { isPaused: true },
  });

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

      // Calculate payouts and total cost
      let totalValidatorPayout = 0;
      const validatorPayouts: {
        validatorId: string;
        payout: number;
        tier: string;
      }[] = [];
      for (const { result, callbackId, validator } of results) {
        const { error, total, signedMessage } = result.data;
        const status = error
          ? WebsiteStatus.OFFLINE
          : total > 1000
            ? WebsiteStatus.DEGRADED
            : WebsiteStatus.ONLINE;
        const verified = verifySignature(
          REPLY_MESSAGE(callbackId),
          signedMessage,
          validator.publicKey
        );
        if (!verified) {
          console.error('Invalid signature from validator');
          continue;
        }
        // Tier and bonus logic
        const tier = getValidatorTier(validator.trustScore);
        const bonus = getTierBonus(tier);
        const payout = COST_PER_VALIDATION * (1 + bonus);
        totalValidatorPayout += payout;
        validatorPayouts.push({
          validatorId: validator.validatorId,
          payout,
          tier,
        });
      }
      const platformFee = totalValidatorPayout * PLATFORM_FEE_PERCENT;
      const totalCost = totalValidatorPayout + platformFee;

      // Deduct from user and add to validators in a transaction
      await prismaClient.$transaction(async tx => {
        // Deduct from user
        await tx.user.update({
          where: { id: website.userId },
          data: { currentBalance: { decrement: totalCost } },
        });
        // Log user transaction
        // await tx.transaction.create({
        //   data: {
        //     signature: randomUUIDv7(),
        //     transactionType: 'PAYOUT',
        //     status: 'Success',
        //     userId: website.userId,
        //     amount: BigInt(Math.round(totalCost)),
        //     instructionData: {
        //       websiteId: website.id,
        //       platformFee,
        //       validatorPayouts,
        //     },
        //   },
        // });
        // Add payout to each validator and log transaction
        for (const { validatorId, payout, tier } of validatorPayouts) {
          await tx.validator.update({
            where: { id: validatorId },
            data: { pendingPayouts: { increment: payout } },
          });
          // await tx.transaction.create({
          //   data: {
          //     signature: randomUUIDv7(),
          //     transactionType: 'PAYOUT',
          //     status: 'Success',
          //     validatorId,
          //     amount: BigInt(Math.round(payout)),
          //     instructionData: { websiteId: website.id, tier },
          //   },
          // });
        }
        // Update trustScore and create WebsiteTick for each validator
        for (const { result, callbackId, validator } of results) {
          const { error, total, signedMessage } = result.data;
          const status = error
            ? WebsiteStatus.OFFLINE
            : total > 1000
              ? WebsiteStatus.DEGRADED
              : WebsiteStatus.ONLINE;
          const verified = verifySignature(
            REPLY_MESSAGE(callbackId),
            signedMessage,
            validator.publicKey
          );
          if (!verified) continue;
          await tx.validator.update({
            where: { id: validator.validatorId },
            data: {
              trustScore: { increment: status === majorityStatus ? 1 : -1 },
            },
          });
          validator.trustScore += status === majorityStatus ? 1 : -1;
          await tx.websiteTick.create({
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
      });

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

function formatIP(ip: string) {
  const ipv4MappedRegex = /^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/;

  // Handle IPv6 loopback
  if (ip === '::1') {
    return '127.0.0.1';
  }

  // Handle IPv4-mapped IPv6
  const mappedMatch = ip.match(ipv4MappedRegex);
  if (mappedMatch) {
    return mappedMatch[1];
  }

  // Check for regular IPv4
  const ipv4Regex =
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
  if (ipv4Regex.test(ip)) {
    return ip;
  }

  // Return raw IPv6 or unrecognized format as-is
  return ip;
}

function getClientIp(req: Request): string {
  const headers = req.headers;
  const cfConnectingIp = headers.get('cf-connecting-ip');
  const forwardedFor = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');

  return (
    cfConnectingIp ||
    (forwardedFor && forwardedFor.split(',')[0].trim()) ||
    realIp ||
    '0.0.0.0'
  );
}

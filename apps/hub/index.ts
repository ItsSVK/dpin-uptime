import { randomUUIDv7, type ServerWebSocket } from 'bun';
import type { IncomingMessage, SignupIncomingMessage } from 'common/types';
import { MessageType } from 'common/types';
import { prismaClient } from 'db/client';
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import nacl_util from 'tweetnacl-util';
import type { Validator } from '@prisma/client';
import {
  WebsiteStatus,
  PrismaClient,
  Prisma,
  UptimePeriod,
} from '@prisma/client';
import { startOfDay, startOfWeek, startOfMonth } from 'date-fns';

const availableValidators: {
  validatorId: string;
  socket: ServerWebSocket<unknown>;
  publicKey: string;
}[] = [];

const CALLBACKS: { [callbackId: string]: (data: IncomingMessage) => void } = {};
const COST_PER_VALIDATION = 100; // in lamports

Bun.serve({
  fetch(req, server) {
    if (server.upgrade(req)) {
      return;
    }
    return new Response('Upgrade failed', { status: 500 });
  },
  port: 8081,
  websocket: {
    async message(ws: ServerWebSocket<unknown>, message: string) {
      const data: IncomingMessage = JSON.parse(message);

      if (data.type === MessageType.SIGNUP) {
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
      } else if (data.type === MessageType.VALIDATE) {
        CALLBACKS[data.data.callbackId](data);
        delete CALLBACKS[data.data.callbackId];
      } else if (data.type === MessageType.HEARTBEAT) {
        // do nothing
      }
    },
    async close(ws: ServerWebSocket<unknown>) {
      availableValidators.splice(
        availableValidators.findIndex(v => v.socket === ws),
        1
      );
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
        region,
        ticks: { create: [] },
      },
      include: {
        ticks: true,
      },
    });
  } else {
    await prismaClient.validator.update({
      where: { id: validatorDb.id },
      data: { ip, country, city, latitude, longitude, region },
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

    availableValidators.push({
      validatorId: validatorDb.id,
      socket: ws,
      publicKey: validatorDb.publicKey,
    });
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
  // Try primary provider (ipapi.co)
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();

    if (!data.error) {
      return {
        country: data.country_name,
        city: data.city,
        region: data.region,
        latitude: data.latitude,
        longitude: data.longitude,
        ip: ip,
      };
    }
    throw new Error('Failed to get location data from primary provider', data);
  } catch (primaryError) {
    console.error('Error with primary geo provider:', primaryError);

    // Try secondary provider (geojs.io - free, no key required, HTTPS)
    try {
      const response = await fetch(`https://get.geojs.io/v1/ip/geo/${ip}.json`);
      const data = await response.json();

      if (data.latitude === 'nil') {
        throw new Error(
          'Failed to get location data from secondary provider',
          data
        );
      }

      return {
        country: data.country,
        city: data.city,
        region: data.region,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        ip: ip,
      };
    } catch (secondaryError) {
      console.error('Error with secondary geo provider:', secondaryError);

      // Return default values if both providers fail
      return {
        country: 'Unknown',
        city: 'Unknown',
        region: 'Unknown',
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

setInterval(async () => {
  const websitesToMonitor = await prismaClient.website.findMany({
    where: {
      isPaused: false,
    },
  });

  if (availableValidators.length === 0) {
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
    `Sending validate to ${availableValidators.length} validators for ${websiteByFrequency.length} websites`
  );

  for (const website of websiteByFrequency) {
    if (website.isPaused) {
      continue;
    }

    availableValidators.forEach(validator => {
      const callbackId = randomUUIDv7();
      console.log(
        `Sending validate to ${validator.validatorId} ${website.url}`
      );
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

      CALLBACKS[callbackId] = async (data: IncomingMessage) => {
        if (data.type === MessageType.VALIDATE) {
          const {
            validatorId,
            statusCode,
            nameLookup,
            connection,
            tlsHandshake,
            dataTransfer,
            ttfb,
            total,
            error,
            signedMessage,
          } = data.data;
          const verified = await verifyMessage(
            `Replying to ${callbackId}`,
            validator.publicKey,
            signedMessage
          );
          if (!verified) {
            return;
          }

          console.log('Validation Results:');
          console.table({
            validatorId,
            statusCode,
            nameLookup,
            connection,
            tlsHandshake,
            dataTransfer,
            ttfb,
            total,
            error,
          });

          const status = data.data.error
            ? WebsiteStatus.OFFLINE
            : data.data.total > 1000
              ? WebsiteStatus.DEGRADED
              : WebsiteStatus.ONLINE;

          await prismaClient.$transaction(async tx => {
            // Calculate new uptime percentage
            const recentTicks = await tx.websiteTick.findMany({
              where: {
                websiteId: website.id,
                createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
              },
              orderBy: { createdAt: 'desc' },
            });

            const totalTicks = recentTicks.length + 1; // Including current tick
            const upTicks =
              recentTicks.filter(tick => tick.status === WebsiteStatus.ONLINE)
                .length + (status === WebsiteStatus.ONLINE ? 1 : 0);
            const newUptimePercentage = (upTicks / totalTicks) * 100;

            // Calculate new average response time
            const validTicks = recentTicks.filter(tick => tick.total != null);
            const totalResponseTime =
              validTicks.reduce((sum, tick) => sum + (tick.total || 0), 0) +
              (data.data.total || 0);
            const newAverageResponse =
              totalResponseTime / (validTicks.length + 1);

            if (website.upSince === null && status === WebsiteStatus.ONLINE) {
              await tx.website.update({
                where: { id: website.id },
                data: {
                  upSince: new Date(),
                  status,
                  uptimePercentage: newUptimePercentage,
                  averageResponse: newAverageResponse,
                  lastCheckedAt: new Date(),
                },
              });
            } else if (
              website.upSince !== null &&
              status === WebsiteStatus.OFFLINE
            ) {
              await tx.website.update({
                where: { id: website.id },
                data: {
                  upSince: null,
                  status,
                  uptimePercentage: newUptimePercentage,
                  averageResponse: newAverageResponse,
                  lastCheckedAt: new Date(),
                },
              });
            } else {
              await tx.website.update({
                where: { id: website.id },
                data: {
                  status,
                  uptimePercentage: newUptimePercentage,
                  averageResponse: newAverageResponse,
                  lastCheckedAt: new Date(),
                },
              });
            }

            await tx.websiteTick.create({
              data: {
                websiteId: website.id,
                validatorId,
                status,
                nameLookup,
                connection,
                tlsHandshake,
                dataTransfer,
                ttfb,
                total,
                error,
                createdAt: new Date(),
              },
            });

            await tx.validator.update({
              where: { id: validatorId },
              data: {
                pendingPayouts: { increment: COST_PER_VALIDATION },
              },
            });

            // Add historical data update
            await updateHistoricalData(tx, website.id);
          });
        }
      };
    });
  }
}, 60 * 1000);

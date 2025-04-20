import { randomUUIDv7, type ServerWebSocket } from 'bun';
import type { IncomingMessage, SignupIncomingMessage } from 'common/types';
import { MessageType } from 'common/types';
import { prismaClient } from 'db/client';
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import nacl_util from 'tweetnacl-util';
import type { Validator } from '@prisma/client';
import { WebsiteStatus } from '@prisma/client';
import { pusherServer } from '@dpin/pusher';
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

async function addMinutes(date: Date | null, minutes: number) {
  if (!date) {
    return new Date();
  }
  return new Date(date.getTime() + minutes * 60 * 1000);
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

setInterval(async () => {
  const websitesToMonitor = await prismaClient.website.findMany({
    where: {
      disabled: false,
    },
  });

  if (availableValidators.length === 0) {
    return;
  }

  const websiteByFrequency = websitesToMonitor.filter(
    async website =>
      (
        await addMinutes(website.lastCheckedAt, website.checkFrequency)
      ).getTime() < Date.now()
  );

  console.log(`Sending validate to ${websiteByFrequency.length} validators`);

  for (const website of websiteByFrequency) {
    if (website.isPaused) {
      await pusherServer.trigger(
        'UPDATED_WEBSITE',
        'website-updated',
        website.id
      );
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
          console.log(
            'validatorId, statusCode, nameLookup, connection, tlsHandshake, dataTransfer, ttfb, total, error'
          );
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

          const status =
            statusCode >= 200 && statusCode < 400
              ? WebsiteStatus.GOOD
              : WebsiteStatus.BAD;

          await prismaClient.$transaction(async tx => {
            if (website.upSince === null && status === WebsiteStatus.GOOD) {
              await tx.website.update({
                where: { id: website.id },
                data: {
                  upSince: new Date(),
                },
              });
            } else if (
              website.upSince !== null &&
              status === WebsiteStatus.BAD
            ) {
              await tx.website.update({
                where: { id: website.id },
                data: {
                  upSince: null,
                },
              });
            }

            await tx.website.update({
              where: { id: website.id },
              data: {
                lastCheckedAt: new Date(),
              },
            });

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
          });

          const updatedWebsite = await prismaClient.website.findUnique({
            where: { id: website.id },
            include: {
              ticks: true,
            },
          });

          if (updatedWebsite) {
            console.log('triggering website-updated', updatedWebsite.id);
            await pusherServer.trigger(
              'UPDATED_WEBSITE',
              'website-updated',
              updatedWebsite.id
            );
          }
        }
      };
    });
  }
}, 60 * 1000);

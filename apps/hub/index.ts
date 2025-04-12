import { randomUUIDv7, type ServerWebSocket } from 'bun';
import type {
  IncomingMessage,
  SignupIncomingMessage,
  Validator,
  WebsiteTick,
} from 'common/types';
import { MessageType, WebsiteStatus } from 'common/types';
import { prismaClient } from 'db/client';
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import nacl_util from 'tweetnacl-util';
import type {
  Validator as PrismaValidator,
  WebsiteStatus as PrismaWebsiteStatusType,
} from '@prisma/client';
import { WebsiteStatus as PrismaWebsiteStatus } from '@prisma/client';

const availableValidators: {
  validatorId: string;
  socket: ServerWebSocket<unknown>;
  publicKey: string;
}[] = [];

const CALLBACKS: { [callbackId: string]: (data: IncomingMessage) => void } = {};
const COST_PER_VALIDATION = 100; // in lamports

const mapToPrismaStatus = (status: WebsiteStatus): PrismaWebsiteStatus => {
  return status === WebsiteStatus.GOOD
    ? PrismaWebsiteStatus.GOOD
    : PrismaWebsiteStatus.BAD;
};

const mapFromPrismaStatus = (status: PrismaWebsiteStatus): WebsiteStatus => {
  return status === PrismaWebsiteStatus.GOOD
    ? WebsiteStatus.GOOD
    : WebsiteStatus.BAD;
};

const mapToValidator = (
  prismaValidator: (PrismaValidator & { ticks: any[] }) | null
): Validator | null => {
  if (!prismaValidator) return null;
  return {
    ...prismaValidator,
    ticks: prismaValidator.ticks.map(tick => ({
      ...tick,
      status: mapFromPrismaStatus(tick.status),
    })) as WebsiteTick[],
  };
};

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
          await signupHandler(ws, data.data);
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
    ip,
    publicKey,
    callbackId,
    country,
    city,
    latitude,
    longitude,
  }: SignupIncomingMessage
) {
  let validatorDb: Validator | null = null;

  validatorDb = mapToValidator(
    await prismaClient.validator.findFirst({
      where: {
        publicKey,
      },
      include: {
        ticks: true,
      },
    })
  );

  if (!validatorDb) {
    validatorDb = mapToValidator(
      await prismaClient.validator.create({
        data: {
          ip,
          publicKey,
          country,
          city,
          latitude,
          longitude,
          ticks: { create: [] },
        },
        include: {
          ticks: true,
        },
      })
    );
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

setInterval(async () => {
  const websitesToMonitor = await prismaClient.website.findMany({
    where: {
      disabled: false,
    },
  });

  if (availableValidators.length === 0) {
    return;
  }

  console.log(`Sending validate to ${availableValidators.length} validators`);

  for (const website of websitesToMonitor) {
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
          },
        })
      );

      CALLBACKS[callbackId] = async (data: IncomingMessage) => {
        if (data.type === MessageType.VALIDATE) {
          const { validatorId, statusCode, latency, signedMessage } = data.data;
          const verified = await verifyMessage(
            `Replying to ${callbackId}`,
            validator.publicKey,
            signedMessage
          );
          if (!verified) {
            return;
          }

          await prismaClient.$transaction(async tx => {
            await tx.websiteTick.create({
              data: {
                websiteId: website.id,
                validatorId,
                status:
                  statusCode >= 200 && statusCode < 400
                    ? PrismaWebsiteStatus.GOOD
                    : PrismaWebsiteStatus.BAD,
                latency,
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
        }
      };
    });
  }
}, 60 * 1000);

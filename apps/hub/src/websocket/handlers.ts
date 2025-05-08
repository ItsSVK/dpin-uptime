import type { ServerWebSocket } from 'bun';
import type { IncomingMessage, SignupIncomingMessage } from 'common';
import { MessageType, VALIDATE_SIGNUP_MESSAGE, verifySignature } from 'common';
import { prismaClient } from 'db/client';
import { mapToRegion } from '@/utils/region'; // Adjust if utils/region.ts is moved/restructured
import { ValidatorManager } from '@/utils/validatorSelection'; // This will need to be an instance
import type { MyWebSocketData } from '@/src/constants';
import { getGeoData } from '@/src/services/geoService';
import { formatIP } from '@/utils/ipUtils'; // Adjust if utils/ipUtils.ts is moved/restructured
import type { Validator } from '@prisma/client';
import { CALLBACKS } from '@/src/constants'; // MyWebSocketData might need to be here if not already

// TODO: validatorManager instance needs to be handled (e.g., passed in or singleton)
// For now, assuming it might be instantiated and exported from index.ts or a central module
// import { validatorManager } from '../../index'; // Placeholder

// Remove temporary stand-in
// const validatorManager = new ValidatorManager();

export async function signupHandler(
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
  }: SignupIncomingMessage,
  validatorManagerInstance: ValidatorManager // Pass instance for now
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

    validatorManagerInstance.addValidator(
      // Use passed instance
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

export async function handleSignupMessage(
  ws: ServerWebSocket<unknown>,
  data: IncomingMessage,
  validatorManagerInstance: ValidatorManager // Pass instance for now
) {
  if (data.type !== MessageType.SIGNUP) return;

  const verified = verifySignature(
    VALIDATE_SIGNUP_MESSAGE(data.data.callbackId, data.data.publicKey),
    data.data.signedMessage,
    data.data.publicKey
  );

  if (verified) {
    const ip = (ws.data as MyWebSocketData).clientIp || '0.0.0.0';
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
    // Pass validatorManagerInstance to signupHandler
    await signupHandler(ws, signUpData, validatorManagerInstance);
  }
}

export function onWebSocketOpen(ws: ServerWebSocket<MyWebSocketData>) {
  console.log(
    'Validator connected from IP:',
    ws.data.clientIp // Access clientIp from ws.data
  );
}

export async function onWebSocketMessage(
  ws: ServerWebSocket<MyWebSocketData>,
  message: string,
  validatorManagerInstance: ValidatorManager
) {
  const data: IncomingMessage = JSON.parse(message as string);

  if (data.type === MessageType.SIGNUP) {
    console.log('Validator Connected: ', data.data.publicKey);
    await handleSignupMessage(ws, data, validatorManagerInstance);
  } else if (data.type === MessageType.VALIDATE) {
    if (CALLBACKS[data.data.callbackId]) {
      CALLBACKS[data.data.callbackId](data);
      delete CALLBACKS[data.data.callbackId];
    }
  } else if (data.type === MessageType.HEARTBEAT) {
    for (const group of validatorManagerInstance.getAllValidators()) {
      if (group.socket === ws) {
        validatorManagerInstance.updateHeartbeat(group.validatorId);
        break;
      }
    }
  }
}

export async function onWebSocketClose(
  ws: ServerWebSocket<MyWebSocketData>,
  validatorManagerInstance: ValidatorManager
) {
  for (const validator of validatorManagerInstance.getAllValidators()) {
    if (validator.socket === ws) {
      validatorManagerInstance.removeValidator(validator.validatorId);
      console.log(
        `Validator Disconnected from IP ${ws.data.clientIp}:`,
        validator.publicKey
      );
      await prismaClient.validator.update({
        where: { id: validator.validatorId },
        data: {
          isActive: false,
        },
      });
      break;
    }
  }
}

import { randomUUID } from "crypto";
import { Request } from "express";
import { pipe } from "fp-ts/lib/function";

import { getDateMsDifference } from "../../utils/date";

const NONCE_EXPYRING_MS = 60000;

export type NonceInfo = {
  instantiationDate: Date;
  nonce: string;
};

// eslint-disable-next-line functional/no-let
let nonceInfo: NonceInfo;

export const getNonceInfo = () => nonceInfo;

const setNonceInfo = (nonce: string, instantiationDate: Date) => {
  nonceInfo = {
    nonce,
    instantiationDate
  };
};

export const generateNewNonce = () =>
  pipe(randomUUID({ disableEntropyCache: true }), uuid =>
    setNonceInfo(uuid, new Date())
  );

const extractNonceFromRequest = (request: Request): string | undefined => {
  const signatureInput = request.get("signature-input");
  if (!signatureInput) {
    return undefined;
  }
  const matchingNonceMaybe = signatureInput.match(/nonce="([^"]+)";/);
  if (!matchingNonceMaybe) {
    return undefined;
  }
  return matchingNonceMaybe[1];
};

export const checkNonceFromRequest = (
  request: Request,
  inputNonceInfo: NonceInfo
): boolean => {
  const nonceFromRequest = extractNonceFromRequest(request);
  if (!nonceFromRequest) {
    return false;
  }
  const isNonceStillValid =
    getDateMsDifference(new Date(), inputNonceInfo.instantiationDate) <
    NONCE_EXPYRING_MS;
  return isNonceStillValid && inputNonceInfo.nonce === nonceFromRequest;
};

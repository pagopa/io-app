import { randomUUID } from "crypto";
import { Request } from "express";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

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

const extractNonceFromRequest = (request: Request): O.Option<string> =>
  pipe(
    request.get("signature-input"),
    O.fromNullable,
    O.fold(
      () => O.none,
      sigInput =>
        pipe(
          sigInput.match(/nonce="([^"]+)";/),
          O.fromNullable,
          O.map(matches => matches[1])
        )
    )
  );

export const checkNonceFromRequest = (request: Request, nonceInfo: NonceInfo) =>
  pipe(
    extractNonceFromRequest(request),
    O.fold(
      () => false,
      requestNonce =>
        getDateMsDifference(new Date(), nonceInfo.instantiationDate) <
          NONCE_EXPYRING_MS && nonceInfo.nonce === requestNonce
    )
  );

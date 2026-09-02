/**
 * this router serves fastLogin API
 */

import { FastLoginResponse } from "@io-app/api-types/generated/definitions/session_manager/FastLoginResponse";
import { Router } from "express";
import * as E from "fp-ts/lib/Either";

import { refreshTokenWithFastLogin } from "../../../features/fastLogin/fastLoginHandler";
import {
  generateNewNonce,
  getNonceInfo
} from "../../../features/fastLogin/nonceHandler";
import { lollipopMiddleware } from "../../../middleware/lollipopMiddleware";
import { addHandler } from "../../../payloads/response";
import { addApiAuthV1Prefix } from "../../../utils/strings";

export const fastLoginRouter = Router();

addHandler(
  fastLoginRouter,
  "post",
  addApiAuthV1Prefix("/fast-login/nonce/generate"),
  (_, res) => {
    generateNewNonce();
    const nonce = getNonceInfo().nonce;
    res.status(200).send({ nonce });
  }
);

addHandler(
  fastLoginRouter,
  "post",
  addApiAuthV1Prefix("/fast-login"),
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  lollipopMiddleware((req, res) => {
    const tokenMaybe = refreshTokenWithFastLogin(req);
    if (!tokenMaybe) {
      res.status(401);
      return;
    }

    const fastLodingResponseEither = FastLoginResponse.decode({
      token: tokenMaybe
    });
    if (E.isLeft(fastLodingResponseEither)) {
      res.status(403);
      return;
    }

    res.status(200).send(fastLodingResponseEither.right);
  })
);

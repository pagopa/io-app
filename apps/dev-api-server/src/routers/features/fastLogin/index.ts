/**
 * this router serves fastLogin API
 */

import { FastLoginResponse } from "@io-app/api-types/generated/definitions/session_manager/FastLoginResponse";
import { Router } from "express";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

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
  lollipopMiddleware((req, res) =>
    pipe(
      refreshTokenWithFastLogin(req),
      O.fromNullable,
      O.fold(
        () => res.status(401),
        token =>
          pipe(
            FastLoginResponse.decode({ token }),
            E.fold(
              () => res.status(403),
              response => res.status(200).send(response)
            )
          )
      )
    )
  )
);

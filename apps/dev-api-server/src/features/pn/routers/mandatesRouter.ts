import { Request, Response, Router } from "express";

import { ioDevServerConfig } from "../../../config";
import { addHandler } from "../../../payloads/response";
import { handleLeftEitherIfNeeded } from "../../../utils/error";
import { authenticationMiddleware } from "../middlewares/authenticationMiddleware";
import { initializationMiddleware } from "../middlewares/initializationMiddleware";
import { MandateRepository } from "../repositories/mandateRepository";
import { checkAndValidateLollipopAndTaxId } from "../services/commonService";
import {
  checkAndCreateTemporaryMandate,
  checkAndCreateValidationCode,
  validationCodeToMandateCreationResponse
} from "../services/mandateService";

const createMandatePath = "/mandate/api/v2/mandates";
export const generateCreateMandatePath = () => createMandatePath;

const acceptMandatePath = "/mandate/api/v2/mandates/:mandateId";
export const generateAcceptMandatePath = (mandateId: string) =>
  acceptMandatePath.replace(":mandateId", mandateId);

export const sendMandatesRouter = Router();

addHandler(
  sendMandatesRouter,
  "post",
  createMandatePath,
  // Middleware have to be used like this (instead of directly giving the middleware to the router via use)
  // because supertest (when testing) calls every middleware upon test initialization, even if it not in a
  // router directly called by the test, thus making every test fail due to the authentication middleware
  authenticationMiddleware(
    initializationMiddleware((req: Request, res: Response) => {
      const taxIdEither = checkAndValidateLollipopAndTaxId(
        ioDevServerConfig.send,
        req
      );
      if (handleLeftEitherIfNeeded(taxIdEither, res)) {
        return;
      }
      const validationCodeEither = checkAndCreateValidationCode(
        req.body,
        taxIdEither.right
      );
      if (handleLeftEitherIfNeeded(validationCodeEither, res)) {
        return;
      }
      const validationCode = validationCodeEither.right;
      const responseBodyEither =
        validationCodeToMandateCreationResponse(validationCode);
      if (handleLeftEitherIfNeeded(responseBodyEither, res)) {
        return;
      }
      res.status(201).json(responseBodyEither.right);
    })
  )
);

addHandler(
  sendMandatesRouter,
  "patch",
  acceptMandatePath,
  // Middleware have to be used like this (instead of directly giving the middleware to the router via use)
  // because supertest (when testing) calls every middleware upon test initialization, even if it not in a
  // router directly called by the test, thus making every test fail due to the authentication middleware
  authenticationMiddleware(
    initializationMiddleware((req: Request, res: Response) => {
      const taxIdEither = checkAndValidateLollipopAndTaxId(
        ioDevServerConfig.send,
        req
      );
      if (handleLeftEitherIfNeeded(taxIdEither, res)) {
        return;
      }
      const mandateId = req.params.mandateId;
      const temporaryMandateEither = checkAndCreateTemporaryMandate(
        req.body,
        mandateId,
        taxIdEither.right
      );
      if (handleLeftEitherIfNeeded(temporaryMandateEither, res)) {
        return;
      }
      res.status(204).json();
    })
  )
);

addHandler(
  sendMandatesRouter,
  "get",
  "/send/private/mandates",
  // Middleware have to be used like this (instead of directly giving the middleware to the router via use)
  // because supertest (when testing) calls every middleware upon test initialization, even if it not in a
  // router directly called by the test, thus making every test fail due to the authentication middleware
  initializationMiddleware((_req: Request, res: Response) => {
    const mandateList = MandateRepository.getMandateList();
    res.status(200).json(mandateList);
  })
);

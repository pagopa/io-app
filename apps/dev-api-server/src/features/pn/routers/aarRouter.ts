import { Request, Response, Router } from "express";

import { ioDevServerConfig } from "../../../config";
import { getProblemJson } from "../../../payloads/error";
import { addHandler } from "../../../payloads/response";
import { handleLeftEitherIfNeeded } from "../../../utils/error";
import { logExpressResponseWarning } from "../../../utils/logging";
import { authenticationMiddleware } from "../middlewares/authenticationMiddleware";
import { initializationMiddleware } from "../middlewares/initializationMiddleware";
import { AARRepository } from "../repositories/aarRepository";
import { notificationOrMandateDataFromQRCode } from "../services/aarService";
import { checkAndValidateLollipopAndTaxId } from "../services/commonService";

const checkQRCodePath = "/delivery/notifications/received/check-qr-code";

export const generateCheckQRPath = () => checkQRCodePath;

export const sendAARRouter = Router();

addHandler(
  sendAARRouter,
  "post",
  checkQRCodePath,
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
      const { aarQrCodeValue: inputQRCodeContent } = req.body;
      if (typeof inputQRCodeContent !== "string") {
        const problemJson = getProblemJson(
          400,
          "Bad body value",
          `Request body does not contain a valid JSON with the 'aarQrCodeValue' property (${inputQRCodeContent})`
        );
        logExpressResponseWarning(400, problemJson);
        res.status(400).json(problemJson);
        return;
      }
      const notificationOrMandateDataEither =
        notificationOrMandateDataFromQRCode(
          inputQRCodeContent,
          taxIdEither.right
        );
      if (handleLeftEitherIfNeeded(notificationOrMandateDataEither, res)) {
        return;
      }
      res.status(200).json(notificationOrMandateDataEither.right);
    })
  )
);

addHandler(
  sendAARRouter,
  "get",
  "/send/private/aars",
  // Middleware have to be used like this (instead of directly giving the middleware to the router via use)
  // because supertest (when testing) calls every middleware upon test initialization, even if it not in a
  // router directly called by the test, thus making every test fail due to the authentication middleware
  initializationMiddleware((_req: Request, res: Response) => {
    const qrCodeList = AARRepository.getAARList();
    res.status(200).json(qrCodeList);
  })
);

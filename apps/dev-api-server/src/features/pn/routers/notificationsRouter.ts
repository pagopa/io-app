import { Request, Response, Router } from "express";

import { ioDevServerConfig } from "../../../config";
import { getProblemJson } from "../../../payloads/error";
import { addHandler } from "../../../payloads/response";
import { handleLeftEitherIfNeeded } from "../../../utils/error";
import { logExpressResponseWarning } from "../../../utils/logging";
import { authenticationMiddleware } from "../middlewares/authenticationMiddleware";
import { initializationMiddleware } from "../middlewares/initializationMiddleware";
import {
  checkAndValidateLollipopAndTaxId,
  checkSourceHeaderNonBlocking,
  mandateIdFromQuery
} from "../services/commonService";
import {
  notificationFromIUN,
  preconditionsForNotification,
  thirdPartyMessageFromIUNTaxIdAndMandateId
} from "../services/notificationsService";

const notificationDisclaimerPath =
  "/ext-registry-private/io/v1/notification-disclaimer/:iun";
const notificationPath = "/delivery/notifications/received/:iun";

export const generateNotificationDisclaimerPath = (iun: string) =>
  notificationDisclaimerPath.replace(":iun", iun);
export const generateNotificationPath = (iun: string, mandateId?: string) => {
  const path = notificationPath.replace(":iun", iun);
  if (mandateId == null || mandateId.trim().length === 0) {
    return path;
  }
  return `${path}?mandateId=${mandateId}`;
};

export const sendNotificationsRouter = Router();

addHandler(
  sendNotificationsRouter,
  "get",
  notificationPath,
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
      checkSourceHeaderNonBlocking(req.headers);
      const requestIUN = req.params.iun;
      const mandateId = mandateIdFromQuery(req);
      const thirdPartyMessageEither = thirdPartyMessageFromIUNTaxIdAndMandateId(
        requestIUN,
        taxIdEither.right,
        mandateId
      );
      if (handleLeftEitherIfNeeded(thirdPartyMessageEither, res)) {
        return;
      }
      res.status(200).json(thirdPartyMessageEither.right);
    })
  ),
  () => 500 + 1000 * Math.random()
);

addHandler(
  sendNotificationsRouter,
  "get",
  notificationDisclaimerPath,
  authenticationMiddleware(
    initializationMiddleware((req: Request, res: Response) => {
      const taxIdEither = checkAndValidateLollipopAndTaxId(
        ioDevServerConfig.send,
        req
      );
      if (handleLeftEitherIfNeeded(taxIdEither, res)) {
        return;
      }
      const requestIUN = req.params.iun;
      const notificationEither = notificationFromIUN(requestIUN);
      if (handleLeftEitherIfNeeded(notificationEither, res)) {
        return;
      }
      const { notification } = notificationEither.right;
      if (notification.recipientFiscalCode !== taxIdEither.right) {
        const problemJson = getProblemJson(
          400,
          "User mismatch",
          `The specified notification does not belong to the user that is requesting it (${notification.iun}) (${taxIdEither.right})`
        );
        logExpressResponseWarning(400, problemJson);
        res.status(400).json(problemJson);
        return;
      }
      const preconditions = preconditionsForNotification(notification);
      res.status(200).json(preconditions);
    })
  ),
  () => 500 + 1000 * Math.random()
);

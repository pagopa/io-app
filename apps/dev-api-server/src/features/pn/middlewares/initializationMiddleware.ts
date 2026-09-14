import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { Request, Response } from "express";
import { Either, isLeft, right } from "fp-ts/lib/Either";

import { ioDevServerConfig } from "../../../config";
import { getProblemJson } from "../../../payloads/error";
import { PaymentsDatabase } from "../../../persistence/payments";
import { logExpressResponseWarning } from "../../../utils/logging";
import {
  ioOrganizationFiscalCode,
  ioOrganizationName
} from "../../services/persistence/services/factory";
import { AARRepository } from "../repositories/aarRepository";
import { DocumentsRepository } from "../repositories/documentRepository";
import { MandateRepository } from "../repositories/mandateRepository";
import { NotificationRepository } from "../repositories/notificationRepository";
import { PrevalidatedUrisRepository } from "../repositories/prevalidatedUrisRepository";
import { SendConfig } from "../types/sendConfig";

// Middleware have to be used like this (instead of directly giving the middleware to the router via use)
// because supertest (when testing) calls every middleware upon test initialization, even if it not in a
// router directly called by the test, thus making every test fail due to the authentication middleware
export const initializationMiddleware =
  (nextRequest: (_req: Request, res: Response) => void) =>
  (request: Request, response: Response) => {
    const initializationEither = initializeSENDRepositoriesIfNeeded();
    if (isLeft(initializationEither)) {
      const problemJson = getProblemJson(
        500,
        "SEND repositories initialization failed",
        `An error occourred while trying to initialize repositories for SEND (${initializationEither.left})`
      );
      logExpressResponseWarning(500, problemJson);
      response.status(500).json();
      return;
    }
    nextRequest(request, response);
  };

const initializeSENDRepositoriesIfNeeded = (
  organizationFiscalCode: OrganizationFiscalCode = ioOrganizationFiscalCode,
  organizationName: string = ioOrganizationName,
  sendConfig: SendConfig = ioDevServerConfig.send,
  userFiscalCode: string = ioDevServerConfig.profile.attrs.fiscal_code
): Either<string, boolean> => {
  const documentsInitializationEither =
    DocumentsRepository.initializeIfNeeded(sendConfig);
  if (isLeft(documentsInitializationEither)) {
    return documentsInitializationEither;
  }

  const notificationsInitializationEither =
    NotificationRepository.initializeIfNeeded(
      sendConfig,
      userFiscalCode,
      DocumentsRepository,
      organizationFiscalCode,
      organizationName,
      PaymentsDatabase
    );
  if (isLeft(notificationsInitializationEither)) {
    return notificationsInitializationEither;
  }

  PrevalidatedUrisRepository.initializeIfNeeded(sendConfig);
  AARRepository.initializeIfNeeded(sendConfig);
  MandateRepository.initializeIfNeeded(sendConfig, userFiscalCode);

  return right(
    documentsInitializationEither.right ||
      notificationsInitializationEither.right
  );
};

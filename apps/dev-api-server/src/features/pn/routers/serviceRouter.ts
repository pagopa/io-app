import { SendActivation } from "@io-app/api-types/generated/definitions/communication/SendActivation";
import { PNActivation } from "@io-app/api-types/generated/definitions/pn/PNActivation";
import { NonNegativeInteger } from "@pagopa/ts-commons/lib/numbers";
import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import { Request, Response, Router } from "express";
import * as E from "fp-ts/lib/Either";

import { ioDevServerConfig } from "../../../config";
import { getProblemJson } from "../../../payloads/error";
import { addHandler } from "../../../payloads/response";
import { logExpressResponseWarning } from "../../../utils/logging";
import { addApiCommunicationV1Prefix } from "../../../utils/strings";
import ServicesDB from "../../services/persistence/servicesDatabase";
import { sendServiceId } from "../services/dataService";

export const sendServiceRouter = Router();

const handlePostSendActivation = (req: Request, res: Response) => {
  const maybeActivation = PNActivation.decode(req.body);
  if (E.isLeft(maybeActivation)) {
    const problemJson = getProblemJson(
      400,
      "Bad request body",
      `Unable to decode request body to PNActivation (${readableReportSimplified(
        maybeActivation.left
      )})`
    );
    logExpressResponseWarning(400, problemJson);
    res.status(400).json(problemJson);
    return;
  }
  const servicePreference = ServicesDB.getPreference(sendServiceId);
  if (servicePreference == null) {
    const problemJson = getProblemJson(
      500,
      "sendServiceId not found",
      `Unable to retrieve Service preferences for sendServiceId (${sendServiceId})`
    );
    logExpressResponseWarning(500, problemJson);
    res.status(500).json(problemJson);
    return;
  }
  if (ioDevServerConfig.send.isServiceUpsertRateLimited) {
    res.status(429).json({});
    return;
  }

  const persistedServicePreference = ServicesDB.updatePreference(
    sendServiceId,
    {
      ...servicePreference,
      is_inbox_enabled: maybeActivation.right.activation_status,
      settings_version: (servicePreference.settings_version +
        1) as NonNegativeInteger
    }
  );
  if (!persistedServicePreference) {
    const problemJson = getProblemJson(
      500,
      "Preferences not updated",
      `Unable to update service preference for sendServiceId (${sendServiceId})`
    );
    logExpressResponseWarning(500, problemJson);
    res.status(500).json(problemJson);
    return;
  }
  res.status(204).send();
};

addHandler(
  sendServiceRouter,
  "get",
  addApiCommunicationV1Prefix("/send/activation"),
  (req: Request, res: Response) => {
    const servicePreference = ServicesDB.getPreference(sendServiceId);
    if (servicePreference == null) {
      const problemJson = getProblemJson(
        500,
        "sendServiceId not found",
        `Unable to retrieve Service preferences for sendServiceId (${sendServiceId})`
      );
      logExpressResponseWarning(500, problemJson);
      res.status(500).json(problemJson);
      return;
    }

    const payload: SendActivation = { activation_status: true };
    res.status(200).json(payload);
  }
);
addHandler(
  sendServiceRouter,
  "post",
  addApiCommunicationV1Prefix("/send/activation"),
  handlePostSendActivation
);

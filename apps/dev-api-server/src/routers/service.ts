import { ServicePreference } from "@io-app/api-types/generated/definitions/identity/ServicePreference";
import { UpsertServicePreference } from "@io-app/api-types/generated/definitions/identity/UpsertServicePreference";
import { ServiceId } from "@io-app/api-types/generated/definitions/services/ServiceId";
import { Router } from "express";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { ioDevServerConfig } from "../config";
import ServicesDB from "../features/services/persistence/servicesDatabase";
import { addHandler } from "../payloads/response";
import { sendFileFromRootPath } from "../utils/file";
import { addApiIdentityV1Prefix } from "../utils/strings";
import { RouteHandler } from "../utils/types";
import { publicRouter } from "./public";

export const serviceRouter = Router();
const configResponse = ioDevServerConfig.services.response;

const preferencesEndpoint = "/services/:service_id/preferences";

const handleGetServicePreference: RouteHandler = (req, res) =>
  pipe(
    configResponse.getServicesPreference,
    O.fromPredicate(statusCode => statusCode !== 200),
    O.fold(
      () =>
        pipe(
          req.params.service_id,
          O.fromNullable,
          O.chain(serviceId =>
            pipe(
              serviceId as ServiceId,
              ServicesDB.getPreference,
              O.fromNullable
            )
          ),
          O.fold(
            () => res.sendStatus(404),
            servicePreference => res.status(200).json(servicePreference)
          )
        ),
      statusCode => res.sendStatus(statusCode)
    )
  );

const handlePostServicePreference: RouteHandler = (req, res) => {
  if (configResponse.postServicesPreference !== 200) {
    res.sendStatus(configResponse.postServicesPreference);
    return;
  }
  const maybeUpdatePreference = UpsertServicePreference.decode(req.body);
  if (E.isLeft(maybeUpdatePreference)) {
    res.sendStatus(400);
    return;
  }
  const updatedPreference: ServicePreference = req.body;

  const serviceId = req.params.service_id as ServiceId;
  const servicePreference = ServicesDB.getPreference(serviceId);
  if (servicePreference === undefined) {
    res.sendStatus(404);
    return;
  }

  if (
    servicePreference.settings_version !== updatedPreference.settings_version
  ) {
    res.sendStatus(409);
    return;
  }

  const persistedServicePreference = ServicesDB.updatePreference(serviceId, {
    ...updatedPreference,
    settings_version: servicePreference.settings_version + 1
  } as ServicePreference);

  if (!persistedServicePreference) {
    res.sendStatus(500);
    return;
  }
  res.json(persistedServicePreference);
};

const handleGetServicesWebView: RouteHandler = (req, res) => {
  sendFileFromRootPath("assets/html/services_web_view.html", res);
};

const handleGetLocalServices: RouteHandler = (_, res) => {
  const localServices = ServicesDB.getLocalServices();
  res.json(localServices);
};

// --- Route registrations ---

addHandler(
  serviceRouter,
  "get",
  addApiIdentityV1Prefix(preferencesEndpoint),
  handleGetServicePreference
);

addHandler(
  serviceRouter,
  "post",
  addApiIdentityV1Prefix(preferencesEndpoint),
  handlePostServicePreference
);

addHandler(publicRouter, "get", "/services_web_view", handleGetServicesWebView);
addHandler(
  publicRouter,
  "get",
  "/services_web_view/local_services",
  handleGetLocalServices
);

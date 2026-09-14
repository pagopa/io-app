import { ServiceId } from "@io-app/api-types/generated/definitions/services/ServiceId";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { ioDevServerConfig } from "../../../config";
import { authorizationMiddleware } from "../../../middleware/authorizationMiddleware";
import { addHandler } from "../../../payloads/response";
import { addApiCatalogV1Prefix } from "../../../utils/strings";
import { RouteHandler } from "../../../utils/types";
import { getFeaturedServicesResponsePayload } from "../payloads/get-featured-services";
import ServicesDB from "../persistence/servicesDatabase";
import { serviceRouter } from "./router";

const serviceConfig = ioDevServerConfig.features.service;

const getFeaturedServicesHandler: RouteHandler = (_, res) =>
  pipe(
    serviceConfig.response.featuredServicesResponseCode,
    O.fromPredicate(statusCode => statusCode !== 200),
    O.fold(
      () =>
        pipe(
          O.of(getFeaturedServicesResponsePayload()),
          O.fold(
            () => res.status(500),
            featuredServices => res.status(200).json(featuredServices)
          )
        ),
      statusCode => res.sendStatus(statusCode)
    )
  );

const getServiceByIdHandler: RouteHandler = (req, res) =>
  pipe(
    serviceConfig.response.serviceByIdResponseCode,
    O.fromPredicate(statusCode => statusCode !== 200),
    O.fold(
      () =>
        pipe(
          req.params.serviceId as ServiceId,
          O.fromNullable,
          O.chain(serviceId =>
            pipe(serviceId, ServicesDB.getService, O.fromNullable)
          ),
          O.fold(
            () => res.sendStatus(404),
            service => res.status(200).json(service)
          )
        ),
      statusCode => res.sendStatus(statusCode)
    )
  );

addHandler(
  serviceRouter,
  "get",
  addApiCatalogV1Prefix("/services/featured"),
  authorizationMiddleware(getFeaturedServicesHandler)
);
addHandler(
  serviceRouter,
  "get",
  addApiCatalogV1Prefix("/services/:serviceId"),
  authorizationMiddleware(getServiceByIdHandler)
);

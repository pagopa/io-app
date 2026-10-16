import { ScopeType } from "@io-app/api-types/generated/definitions/services/ScopeType";
import { sequenceT } from "fp-ts/lib/Apply";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { ioDevServerConfig } from "../../../config";
import { authorizationMiddleware } from "../../../middleware/authorizationMiddleware";
import { addHandler } from "../../../payloads/response";
import { addApiCatalogV1Prefix } from "../../../utils/strings";
import { RouteHandler } from "../../../utils/types";
import { getFeaturedInstitutionsResponsePayload } from "../payloads/get-featured-institutions";
import { getInstitutionsResponsePayload } from "../payloads/get-institutions";
import { getServicesByInstitutionIdResponsePayload } from "../payloads/get-services";
import { serviceRouter } from "./router";

const serviceConfig = ioDevServerConfig.features.service;

type Query =
  | Array<qs.ParsedQs>
  | Array<string>
  | qs.ParsedQs
  | string
  | undefined;

const extractQuery = (query: Query) =>
  pipe(
    query,
    O.fromNullable,
    O.map(s => parseInt(s as string, 10)),
    O.toUndefined
  );

const findInstitutionsHandler: RouteHandler = (req, res) =>
  pipe(
    serviceConfig.response.institutionsResponseCode,
    O.fromPredicate(statusCode => statusCode !== 200),
    O.fold(
      () =>
        pipe(
          sequenceT(O.Monad)(
            O.of(pipe(req.query.limit as Query, extractQuery)),
            O.of(pipe(req.query.offset as Query, extractQuery)),
            O.of(
              pipe(
                req.query.scope,
                ScopeType.decode,
                O.fromEither,
                O.toUndefined
              )
            ),
            O.of(
              pipe(req.query.search as string, O.fromNullable, O.toUndefined)
            )
          ),
          O.chain(args => getInstitutionsResponsePayload(...args)),
          O.fold(
            () => res.status(404),
            instituitions => res.status(200).json(instituitions)
          )
        ),
      statusCode => res.sendStatus(statusCode)
    )
  );

const findInstitutionServicesHandler: RouteHandler = (req, res) =>
  pipe(
    serviceConfig.response.servicesByInstitutionIdResponseCode,
    O.fromPredicate(statusCode => statusCode !== 200),
    O.fold(
      () =>
        pipe(
          sequenceT(O.Monad)(
            O.fromNullable(req.params.institutionId),
            O.of(pipe(req.query.limit as Query, extractQuery)),
            O.of(pipe(req.query.offset as Query, extractQuery))
          ),
          O.chain(args => getServicesByInstitutionIdResponsePayload(...args)),
          O.fold(
            () => res.status(404),
            services => res.status(200).json(services)
          )
        ),
      statusCode => res.sendStatus(statusCode)
    )
  );

const getFeaturedInstitutionsHandler: RouteHandler = (_, res) =>
  pipe(
    serviceConfig.response.featuredInstitutionsResponseCode,
    O.fromPredicate(statusCode => statusCode !== 200),
    O.fold(
      () =>
        pipe(
          O.of(getFeaturedInstitutionsResponsePayload()),
          O.fold(
            () => res.status(404),
            featuredInstitutions => res.status(200).json(featuredInstitutions)
          )
        ),
      statusCode => res.sendStatus(statusCode)
    )
  );

// --- Route registrations ---

addHandler(
  serviceRouter,
  "get",
  addApiCatalogV1Prefix("/institutions"),
  authorizationMiddleware(findInstitutionsHandler)
);

addHandler(
  serviceRouter,
  "get",
  addApiCatalogV1Prefix("/institutions/:institutionId/services"),
  authorizationMiddleware(findInstitutionServicesHandler)
);

addHandler(
  serviceRouter,
  "get",
  addApiCatalogV1Prefix("/institutions/featured"),
  authorizationMiddleware(getFeaturedInstitutionsHandler)
);

import { fakerIT as faker } from "@faker-js/faker";
import { Access } from "@io-app/api-types/generated/definitions/fims_history/Access";
import { AccessHistoryPage } from "@io-app/api-types/generated/definitions/fims_history/AccessHistoryPage";
import { Redirect } from "@io-app/api-types/generated/definitions/fims_history/Redirect";
import { ServiceDetails } from "@io-app/api-types/generated/definitions/services/ServiceDetails";
import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import { Request } from "express";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import { ulid } from "ulid";

import ServicesDB from "../../services/persistence/servicesDatabase";
import { FIMSConfig } from "../types/config";
import { LastExportRequest } from "../types/lastExportRequest";

export const generateAccessHistoryData = (
  config: FIMSConfig
): ReadonlyArray<Access> => {
  const services = ServicesDB.getAllServices();
  if (services.length === 0) {
    throw new Error("FIMS cannot work without any configured service");
  }

  const relyingPartyNameForService = new Map<string, Redirect>();

  const historyConfig = config.history;
  return RA.makeBy(historyConfig.count, index =>
    generateAccess(index, services, relyingPartyNameForService)
  );
};

const generateAccess = (
  index: number,
  services: Array<ServiceDetails>,
  relyingPartyNameForService: Map<string, Redirect>
): Access => {
  const serviceId =
    services[Math.round(Math.random() * (services.length - 1))].id;
  if (!relyingPartyNameForService.has(serviceId)) {
    relyingPartyNameForService.set(serviceId, {
      display_name: faker.company.name(),
      uri: faker.internet.url()
    });
  }
  const redirect = relyingPartyNameForService.get(serviceId) ?? "";

  const timestamp = new Date();
  timestamp.setMonth(timestamp.getMonth() - index);
  const accessEither = Access.decode({
    id: ulid(),
    service_id: serviceId,
    redirect,
    timestamp: timestamp.toISOString()
  });
  if (E.isLeft(accessEither)) {
    throw Error(
      `Unable to generate 'Access' instance (${readableReportSimplified(
        accessEither.left
      )})`
    );
  }
  return accessEither.right;
};

export const nextAccessHistoryPageFromRequest = (
  config: FIMSConfig,
  maybeHistory: O.Option<ReadonlyArray<Access>>,
  req: Request
): E.Either<string, AccessHistoryPage> => {
  if (O.isNone(maybeHistory)) {
    return E.left("History not initialized");
  }

  const history = maybeHistory.value;
  const pageSize = config.history.pageSize;

  const page = req.query.page;
  if (page) {
    const firstItemIndex = history.findIndex(
      pieceOfData => pieceOfData.id === page
    );
    if (firstItemIndex < 0) {
      return E.left(`No match for 'page' (${page})`);
    }
    const lastItemIndex = Math.min(firstItemIndex + pageSize, history.length);
    return generateAccessHistoryPage(history, firstItemIndex, lastItemIndex);
  }

  const lastItemIndex = Math.min(pageSize, history.length);
  return generateAccessHistoryPage(history, 0, lastItemIndex);
};

const generateAccessHistoryPage = (
  history: ReadonlyArray<Access>,
  sliceStart: number,
  sliceEnd: number
): E.Either<string, AccessHistoryPage> => {
  const accessHistoryPageEither = AccessHistoryPage.decode({
    data: history.slice(sliceStart, sliceEnd),
    next: sliceEnd < history.length ? history[sliceEnd].id : undefined
  });
  if (E.isLeft(accessHistoryPageEither)) {
    return E.left(readableReportSimplified(accessHistoryPageEither.left));
  }
  return accessHistoryPageEither;
};

export const isProcessingExport = (
  config: FIMSConfig,
  lastExportRequestMaybe: O.Option<LastExportRequest>
) =>
  O.isSome(lastExportRequestMaybe) &&
  Date.now() - lastExportRequestMaybe.value.timestamp <
    config.history.exportProcessingTimeMilliseconds;

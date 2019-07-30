/**
 * Action types and action creator related to Services.
 */

import { ITuple2 } from "italia-ts-commons/lib/tuples";
import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";

import { PaginatedServiceTupleCollection } from "../../../definitions/backend/PaginatedServiceTupleCollection";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";

//
// load visible services
//

export const loadVisibleServices = createAsyncAction(
  "SERVICES_VISIBLE_LOAD_REQUEST",
  "SERVICES_VISIBLE_LOAD_SUCCESS",
  "SERVICES_VISIBLE_LOAD_FAILURE"
)<void, PaginatedServiceTupleCollection["items"], void>();

//
// load single service
//

export const loadService = createAsyncAction(
  "SERVICE_LOAD_REQUEST",
  "SERVICE_LOAD_SUCCESS",
  "SERVICE_LOAD_FAILURE"
)<string, ServicePublic, string>();

//
// show service detail
//

export const showServiceDetails = createStandardAction("SERVICE_SHOW_DETAILS")<
  ServicePublic
>();

// Remove services passing a list of tuples with serviceId and organizationFiscalCode
export const removeServiceTuples = createStandardAction(
  "SERVICES_REMOVE_TUPLES"
)<ReadonlyArray<ITuple2<string, string | undefined>>>();

export type ServicesActions =
  | ActionType<typeof loadVisibleServices>
  | ActionType<typeof loadService>
  | ActionType<typeof removeServiceTuples>
  | ActionType<typeof showServiceDetails>;

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
import { ServiceId } from "../../../definitions/backend/ServiceId";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";

//
// service loading at startup
//

export const FirstServiceLoadSuccess = createStandardAction(
  "FIRST_SERVICES_LOAD_SUCCESS"
)<void>();

//
// load visible services
//

export const loadVisibleServices = createAsyncAction(
  "SERVICES_VISIBLE_LOAD_REQUEST",
  "SERVICES_VISIBLE_LOAD_SUCCESS",
  "SERVICES_VISIBLE_LOAD_FAILURE"
)<void, PaginatedServiceTupleCollection["items"], Error>();

//
// load single service
//

type ServiceLoadFailurePayload = {
  error: Error;
  service_id: string;
};

export const loadServiceContent = createAsyncAction(
  "SERVICE_CONTENT_LOAD_REQUEST",
  "SERVICE_CONTENT_LOAD_SUCCESS",
  "SERVICE_CONTENT_LOAD_FAILURE"
)<string, ServicePublic, ServiceLoadFailurePayload>();
//
//  mark service as read
//

export const markServiceAsRead = createStandardAction("MARK_SERVICE_AS_READ")<
  ServiceId
>();

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
  | ActionType<typeof FirstServiceLoadSuccess>
  | ActionType<typeof loadVisibleServices>
  | ActionType<typeof loadServiceContent>
  | ActionType<typeof markServiceAsRead>
  | ActionType<typeof removeServiceTuples>
  | ActionType<typeof showServiceDetails>;

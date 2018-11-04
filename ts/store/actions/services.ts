/**
 * Action types and action creator related to Services.
 */

import { ActionType, createStandardAction } from "typesafe-actions";

import { ServiceList } from "../../../definitions/backend/ServiceList";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";

//
// load visible services
//

export const loadVisibleServicesRequest = createStandardAction(
  "VISIBLE_SERVICES_LOAD_REQUEST"
)();

export const loadVisibleServicesSuccess = createStandardAction(
  "VISIBLE_SERVICES_LOAD_SUCCESS"
)<ServiceList["items"]>();

export const loadVisibleServicesFailure = createStandardAction(
  "VISIBLE_SERVICES_LOAD_FAILURE"
)();

//
// load single service
//

export const loadServiceRequest = createStandardAction("SERVICE_LOAD_REQUEST")<
  string
>();

export const loadServiceSuccess = createStandardAction("SERVICE_LOAD_SUCCESS")<
  ServicePublic
>();

export const loadServiceFailure = createStandardAction("SERVICE_LOAD_FAILURE")<
  string
>();

export type ServicesActions = ActionType<
  // tslint:disable-next-line:max-union-size
  | typeof loadVisibleServicesRequest
  | typeof loadVisibleServicesSuccess
  | typeof loadVisibleServicesFailure
  | typeof loadServiceRequest
  | typeof loadServiceSuccess
  | typeof loadServiceFailure
>;

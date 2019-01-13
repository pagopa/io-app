/**
 * Action types and action creator related to Services.
 */

import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";

import { ServiceList } from "../../../definitions/backend/ServiceList";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";

//
// load visible services
//

export const loadVisibleServices = createAsyncAction(
  "SERVICES_VISIBLE_LOAD_REQUEST",
  "SERVICES_VISIBLE_LOAD_SUCCESS",
  "SERVICES_VISIBLE_LOAD_FAILURE"
)<void, ServiceList["items"], void>();

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
  | typeof loadVisibleServices
  | typeof loadServiceRequest
  | typeof loadServiceSuccess
  | typeof loadServiceFailure
>;

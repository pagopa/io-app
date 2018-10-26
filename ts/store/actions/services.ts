/**
 * Action types and action creator related to Services.
 */

import { TypeofApiResponse } from "italia-ts-commons/lib/requests";
import {
  ActionType,
  createAction,
  createStandardAction
} from "typesafe-actions";

import { GetVisibleServicesT } from "../../../definitions/backend/requestTypes";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";

export const loadServicesRequest = createStandardAction(
  "SERVICES_LOAD_REQUEST"
)();

export const loadServicesSuccess = createStandardAction(
  "SERVICES_LOAD_SUCCESS"
)<TypeofApiResponse<GetVisibleServicesT>>();

export const loadServicesFailure = createStandardAction(
  "SERVICES_LOAD_FAILURE"
)();

export const loadServiceSuccess = createStandardAction("SERVICE_LOAD_SUCCESS")<
  ServicePublic
>();

export const loadServiceFailure = createAction(
  "SERVICE_LOAD_FAILURE",
  resolve => (error: Error) => resolve(error, { error: true })
);

export type ServicesActions = ActionType<
  typeof loadServiceSuccess | typeof loadServiceFailure
>;

/**
 * Action types and action creator related to Services.
 */

import { ActionType, createAction } from "typesafe-actions";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";

export const loadServiceSuccess = createAction(
  "SERVICE_LOAD_SUCCESS",
  resolve => (service: ServicePublic) => resolve(service)
);

export const loadServiceFailure = createAction(
  "SERVICE_LOAD_FAILURE",
  resolve => (error: Error) => resolve(error, { error: true })
);

export type ServicesActions = ActionType<
  typeof loadServiceSuccess | typeof loadServiceFailure
>;

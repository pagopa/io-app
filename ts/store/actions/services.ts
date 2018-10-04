/**
 * Action types and action creator related to Services.
 */

import {
  ActionType,
  createAction,
  createStandardAction
} from "typesafe-actions";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";

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

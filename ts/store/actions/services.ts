/**
 * Action types and action creator related to Services.
 */

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { SERVICE_LOAD_FAILURE, SERVICE_LOAD_SUCCESS } from "./constants";

type ServiceLoadSuccess = Readonly<{
  type: typeof SERVICE_LOAD_SUCCESS;
  payload: ServicePublic;
}>;

export type ServiceLoadFailure = Readonly<{
  type: typeof SERVICE_LOAD_FAILURE;
  payload: Error;
  error: true;
}>;

export type ServicesActions = ServiceLoadSuccess | ServiceLoadFailure;

// Creators
export const loadServiceSuccess = (
  service: ServicePublic
): ServiceLoadSuccess => ({
  type: SERVICE_LOAD_SUCCESS,
  payload: service
});

export const loadServiceFailure = (error: Error): ServiceLoadFailure => ({
  type: SERVICE_LOAD_FAILURE,
  payload: error,
  error: true
});

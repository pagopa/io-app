/**
 * Action types and action creator related to Services.
 */

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { SERVICE_LOAD_SUCCESS } from "./constants";

export type ServiceLoadSuccess = Readonly<{
  type: typeof SERVICE_LOAD_SUCCESS;
  payload: ServicePublic;
}>;

export type ServicesActions = ServiceLoadSuccess;

// Creators
export const loadServiceSuccess = (
  service: ServicePublic
): ServiceLoadSuccess => ({
  type: SERVICE_LOAD_SUCCESS,
  payload: service
});

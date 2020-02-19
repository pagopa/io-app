/**
 * Action types and action creator related to BackedServicesStatus.
 */
import { ActionType, createStandardAction } from "typesafe-actions";

export const backendServicesStatus = createStandardAction(
  "BACKEND_SERVICES_STATUS_LOAD_SUCCESS"
)<boolean>();

export type BackendServicesStatusActions = ActionType<
  typeof backendServicesStatus
>;

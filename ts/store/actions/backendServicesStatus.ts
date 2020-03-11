/**
 * Action types and action creator related to BackedServicesStatus.
 */
import { ActionType, createStandardAction } from "typesafe-actions";
import { BackendServicesStatus } from "../../api/backendPublic";

export const backendServicesStatus = createStandardAction(
  "BACKEND_SERVICES_STATUS_LOAD_SUCCESS"
)<BackendServicesStatus>();

export type BackendServicesStatusActions = ActionType<
  typeof backendServicesStatus
>;

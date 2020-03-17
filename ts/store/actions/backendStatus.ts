/**
 * Action types and action creator related to BackedServicesStatus.
 */
import { ActionType, createStandardAction } from "typesafe-actions";
import { BackendStatus } from "../../api/backendPublic";

export const backendServicesStatusLoadSuccess = createStandardAction(
  "BACKEND_SERVICES_STATUS_LOAD_SUCCESS"
)<BackendStatus>();

export type BackendServicesStatusActions = ActionType<
  typeof backendServicesStatusLoadSuccess
>;

/**
 * Action types and action creator related to BackedServicesStatus.
 */
import { ActionType, createStandardAction } from "typesafe-actions";
import { BackendStatus } from "../../types/backendStatus";

export const backendStatusLoadSuccess = createStandardAction(
  "BACKEND_STATUS_LOAD_SUCCESS"
)<BackendStatus>();

export type BackendStatusActions = ActionType<typeof backendStatusLoadSuccess>;

import { BackendStatus } from "@io-app/api-types/generated/definitions/content/BackendStatus";
/**
 * Action types and action creator related to BackedServicesStatus.
 */
import { ActionType, createStandardAction } from "typesafe-actions";

export const backendStatusLoadSuccess = createStandardAction(
  "BACKEND_STATUS_LOAD_SUCCESS"
)<BackendStatus>();

export type BackendStatusActions = ActionType<typeof backendStatusLoadSuccess>;

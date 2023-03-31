import { ActionType, createStandardAction } from "typesafe-actions";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";

/**
 * Action for requesting data to show in the new profile screen.
 */
export const getNewProfile = createStandardAction("GET_NEW_PROFILE")();

/**
 * Action to dispatch a success state when the API call succedes.
 */
export const getNewProfileSuccess = createStandardAction(
  "GET_NEW_PROFILE_SUCCESS"
)<InitializedProfile>();

/**
 * Action to dispatch an error state when the API call fails.
 */
export const getNewProfileError = createStandardAction(
  "GET_NEW_PROFILE_ERROR"
)<Error>();

/**
 * Intersection type of any possible action.
 */
export type NewProfileActions =
  | ActionType<typeof getNewProfile>
  | ActionType<typeof getNewProfileSuccess>
  | ActionType<typeof getNewProfileError>;

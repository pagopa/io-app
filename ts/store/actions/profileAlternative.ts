/**
 * Action types and action creator related to the Profile.
 */
import {
  ActionType,
  createAction,
  createStandardAction
} from "typesafe-actions";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";

export const profileAlternativeLoadRequest = createStandardAction(
  "PROFILE_ALTERNATIVE_LOAD_REQUEST"
)();
export const profileAlternativeLoadSuccess = createStandardAction(
  "PROFILE_ALTERNATIVE_LOAD_SUCCESS"
)<InitializedProfile>();

export const profileAlternativeLoadFailure = createAction(
  "PROFILE_ALTERNATIVE_LOAD_FAILURE",
  resolve => (error: Error) => resolve(error, { error: true })
);

export type ProfileAlternativeActions =
  | ActionType<typeof profileAlternativeLoadRequest>
  | ActionType<typeof profileAlternativeLoadSuccess>
  | ActionType<typeof profileAlternativeLoadFailure>;

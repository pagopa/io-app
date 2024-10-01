/**
 * A reducer for the alternative Profile.
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import { Action } from "../actions/types";
import {
  profileAlternativeLoadFailure,
  profileAlternativeLoadRequest,
  profileAlternativeLoadSuccess
} from "../actions/profileAlternative";
import { ProfileError } from "./profileErrorType";
import { GlobalState } from "./types";

export type AlternativeProfileState = pot.Pot<InitializedProfile, ProfileError>;

const INITIAL_STATE: AlternativeProfileState = pot.none;

export const profileAlternativeSelector = (
  state: GlobalState
): AlternativeProfileState => state.alternativeProfile;

const reducer = (
  state: AlternativeProfileState = INITIAL_STATE,
  action: Action
): AlternativeProfileState => {
  switch (action.type) {
    case getType(profileAlternativeLoadRequest):
      return pot.toLoading(state);

    case getType(profileAlternativeLoadSuccess):
      return pot.some(action.payload);

    case getType(profileAlternativeLoadFailure):
      return pot.toError(state, action.payload);

    default:
      return state;
  }
};

export default reducer;

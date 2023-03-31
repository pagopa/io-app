import { getType } from "typesafe-actions";
import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  getNewProfile,
  getNewProfileSuccess,
  getNewProfileError
} from "../actions/newProfile";
import { Action } from "../actions/types";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import { GlobalState } from "./types";

export type NewProfileState = pot.Pot<InitializedProfile, Error>;

const initialState: NewProfileState = pot.none;

/**
 * Reducer for the new profile screen which handles the information fetching state.
 * Dispatches three states:
 * getNewProfile, when the screen is initialized and is fetching the profile data;
 * getNewProfileSuccess, when the fetching operation is successful;
 * getNewProfileError, when the fetching operation failed.
 * @param state - The current state, defaults to {@link initialState}
 * @param action - The action to be dispatched, subset of {@link @Action}, {@link NewProfileActions}.
 * @returns The new state or the current one if the action is not in {@link NewProfileActions}.
 */
const newProfileReducer = (
  state: NewProfileState = initialState,
  action: Action
): NewProfileState => {
  switch (action.type) {
    case getType(getNewProfile):
      return pot.toLoading(state);
    case getType(getNewProfileSuccess):
      return pot.some(action.payload);
    case getType(getNewProfileError):
      return pot.toError(state, action.payload);
    default:
      return state;
  }
};

/**
 * Selects the new profile state from the global state.
 * @param state - the global state.
 * @returns the new profile state.
 */
export const newProfileStateSelector = (state: GlobalState): NewProfileState =>
  state.newProfile;

export default newProfileReducer;

/**
 * A reducer for the Installation state.
 * @flow
 */
import { getType } from "typesafe-actions";

import { previousInstallationDataDeleteSuccess } from "../actions/installation";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type InstallationState = Readonly<{
  isFirstRunAfterInstall: boolean;
}>;

const INITIAL_STATE: InstallationState = {
  isFirstRunAfterInstall: true
};

// Selectors
export const isFirstRunAfterInstallSelector = (state: GlobalState): boolean =>
  state.installation.isFirstRunAfterInstall;

const reducer = (
  state: InstallationState = INITIAL_STATE,
  action: Action
): InstallationState => {
  switch (action.type) {
    case getType(previousInstallationDataDeleteSuccess):
      return {
        isFirstRunAfterInstall: false
      };

    default:
      return state;
  }
};

export default reducer;

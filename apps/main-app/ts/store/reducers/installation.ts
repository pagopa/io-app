import * as AR from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
/**
 * A reducer for the Installation state.
 * @flow
 */
import { getType } from "typesafe-actions";

import {
  appVersionHistory,
  previousInstallationDataDeleteSuccess
} from "../actions/installation";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export const MAX_APP_VERSION_HISTORY_SIZE = 10;

export type InstallationState = Readonly<{
  appVersionHistory: Array<string>;
  isFirstRunAfterInstall: boolean;
}>;

export const INSTALLATION_INITIAL_STATE: InstallationState = {
  isFirstRunAfterInstall: true,
  // hold the last MAX_APP_VERSION_HISTORY_SIZE app versions, ASC ordered (the last one at the end of the array is the latest added)
  appVersionHistory: []
};

// Selectors
export const isFirstRunAfterInstallSelector = (state: GlobalState): boolean =>
  state.installation.isFirstRunAfterInstall;

export const appVersionHistorySelector = (
  state: GlobalState
): InstallationState["appVersionHistory"] =>
  state.installation.appVersionHistory;

const reducer = (
  state: InstallationState = INSTALLATION_INITIAL_STATE,
  action: Action
): InstallationState => {
  switch (action.type) {
    case getType(appVersionHistory):
      // avoid duplicated elements
      if (state.appVersionHistory.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        appVersionHistory: pipe(
          [...state.appVersionHistory, action.payload],
          AR.takeRight(MAX_APP_VERSION_HISTORY_SIZE)
        )
      };
    case getType(previousInstallationDataDeleteSuccess):
      return { ...state, isFirstRunAfterInstall: false };
    default:
      return state;
  }
};

export default reducer;

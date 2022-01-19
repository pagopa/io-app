import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { mvlPreferencesDontAskForAttachments } from "../actions";

export type MvlPreferences = {
  showAlertForAttachments: boolean;
};

export const initialState: MvlPreferences = { showAlertForAttachments: true };

/**
 * Store the preferences for MVL
 * @param state
 * @param action
 */
export const mvlPreferencesReducer = (
  state: MvlPreferences = initialState,
  action: Action
): MvlPreferences => {
  switch (action.type) {
    case getType(mvlPreferencesDontAskForAttachments):
      return { ...state, showAlertForAttachments: false };
  }

  return state;
};

/**
 * From MVLId to Mvl
 */
export const mvlPreferencesSelector = createSelector(
  [(state: GlobalState) => state.features.mvl.preferences],
  (_): MvlPreferences => _
);

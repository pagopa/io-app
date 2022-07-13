import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { pnPreferencesSetWarningForMessageOpening } from "../actions";

export type PnPreferences = {
  showAlertForMessageOpening: boolean;
};

export const initialState: PnPreferences = { showAlertForMessageOpening: true };

/**
 * Store the preferences for PN
 * @param state
 * @param action
 */
export const pnPreferencesReducer = (
  state: PnPreferences = initialState,
  action: Action
): PnPreferences => {
  switch (action.type) {
    case getType(pnPreferencesSetWarningForMessageOpening):
      return { ...state, showAlertForMessageOpening: action.payload };
  }

  return state;
};

export const pnPreferencesSelector = createSelector(
  [(state: GlobalState) => state.features.pn.preferences],
  (_): PnPreferences => _
);

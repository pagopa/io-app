import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { loadServicePreference } from "../../../../store/actions/services/servicePreference";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { pnActivationUpsert } from "../actions";

export type PnActivationState = pot.Pot<boolean, Error>;

export const initialState: PnActivationState = pot.none;

/**
 * Store the activation state of the PN service
 * @param state
 * @param action
 */
export const pnActivationReducer = (
  state: PnActivationState = initialState,
  action: Action
): PnActivationState => {
  switch (action.type) {
    case getType(pnActivationUpsert.request):
      return pot.toUpdating(state, action.payload);
    case getType(pnActivationUpsert.success):
      return pot.some(action.payload);
    case getType(pnActivationUpsert.failure):
      return pot.toError(state, action.payload);
    case getType(loadServicePreference.request):
      return pot.none;
  }
  return state;
};

export const pnActivationSelector = createSelector(
  [(state: GlobalState) => state.features.pn.activation],
  (_): PnActivationState => _
);

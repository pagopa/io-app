import { getType } from "typesafe-actions";

import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { pnActivationUpsert } from "../actions";

export type PnActivationState = {
  isActivating: boolean;
};

const initialState = { isActivating: false };

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
    case getType(pnActivationUpsert.failure):
    case getType(pnActivationUpsert.success):
      return {
        isActivating: false
      };
    case getType(pnActivationUpsert.request):
      return {
        isActivating: true
      };
  }
  return state;
};

export const isLoadingPnActivationSelector = (state: GlobalState) =>
  state.features.pn.activation.isActivating;

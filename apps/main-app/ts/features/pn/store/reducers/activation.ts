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
    case getType(pnActivationUpsert.request):
      return {
        isActivating: true
      };
    case getType(pnActivationUpsert.success):
    case getType(pnActivationUpsert.failure):
      return {
        isActivating: false
      };
  }
  return state;
};

export const isLoadingPnActivationSelector = (state: GlobalState) =>
  state.features.pn.activation.isActivating;

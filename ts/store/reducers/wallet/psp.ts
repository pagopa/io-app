/**
 * Reducers, states, selectors and guards for the psp
 */
import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { Psp } from "../../../types/pagopa";
import { Action } from "../../actions/types";
import { fetchPsp } from "../../actions/wallet/transactions";
import { GlobalState } from "../types";

export type PspState = Readonly<{
  psp: pot.Pot<Psp, Error>;
}>;

const PSP_INITIAL_STATE: PspState = {
  psp: pot.none
};

// selectors
export const pspSelector = (state: GlobalState) => state.wallet.psp.psp;

// reducer
const reducer = (
  state: PspState = PSP_INITIAL_STATE,
  action: Action
): PspState => {
  switch (action.type) {
    case getType(fetchPsp.request):
      return {
        ...state,
        psp: pot.noneLoading
      };

    case getType(fetchPsp.success):
      return {
        ...state,
        psp: pot.some(action.payload)
      };

    case getType(fetchPsp.failure):
      return {
        ...state,
        psp: pot.toError(state.psp, action.payload)
      };

    default:
      return state;
  }
};

export default reducer;

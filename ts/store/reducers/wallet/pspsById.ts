/**
 * A reducer to store the psps by id
 */

import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { Psp } from "../../../types/pagopa";
import { Action } from "../../actions/types";
import { fetchPsp } from "../../actions/wallet/transactions";
import { GlobalState } from "../types";

export type PspState = {
  psp: pot.Pot<Psp, Error>;
};

// An object containing Psp keyed by id
export type PspStateById = Readonly<{
  [key: string]: PspState | undefined;
}>;

const INITIAL_STATE: PspStateById = {};

const reducer = (
  state: PspStateById = INITIAL_STATE,
  action: Action
): PspStateById => {
  switch (action.type) {
    case getType(fetchPsp.request):
      return {
        ...state,
        [action.payload.idPsp]: {
          psp: pot.noneLoading
        }
      };

    case getType(fetchPsp.success): {
      const id = action.payload.idPsp;
      const prevState = state[id];
      if (prevState === undefined) {
        // we can't deal with a success without a request
        return state;
      }
      return {
        ...state,
        [id]: { ...prevState, psp: pot.some(action.payload.psp) }
      };
    }
    case getType(fetchPsp.failure): {
      const id = action.payload.idPsp;
      const prevState = state[id];
      if (prevState === undefined) {
        // we can't deal with a failure without a request
        return state;
      }
      return {
        ...state,
        [id]: {
          ...prevState,
          psp: pot.noneError(action.payload.error)
        }
      };
    }

    default:
      return state;
  }
};

// Selectors
export const pspStateByIdSelector = (id: string) => (state: GlobalState) =>
  state.wallet.pspsById[id];

export default reducer;

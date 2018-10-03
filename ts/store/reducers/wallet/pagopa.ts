import { none, Option } from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";

import { Action } from "../../actions/types";
import { storePagoPaToken } from "../../actions/wallet/pagopa";
import { GlobalState } from "../types";

export type PagoPaState = Readonly<{
  token: Option<string>;
}>;

const PAGOPA_INITIAL_STATE = {
  token: none
};

export const getPagoPaToken = (state: GlobalState) => state.wallet.pagoPa.token;

const reducer = (state: PagoPaState = PAGOPA_INITIAL_STATE, action: Action) => {
  if (action.type === getType(storePagoPaToken)) {
    return {
      ...state,
      token: action.payload
    };
  }
  return state;
};

export default reducer;

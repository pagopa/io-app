import { none, Option } from "fp-ts/lib/Option";
import { PAGOPA_STORE_TOKEN } from "../../actions/constants";
import { Action } from "../../actions/types";
import { GlobalState } from "../types";

export type PagoPaState = Readonly<{
  token: Option<string>;
}>;

const PAGOPA_INITIAL_STATE = {
  token: none
};

export const getPagoPaToken = (state: GlobalState) => state.wallet.pagoPa.token;

const reducer = (state: PagoPaState = PAGOPA_INITIAL_STATE, action: Action) => {
  if (action.type === PAGOPA_STORE_TOKEN) {
    return {
      ...state,
      token: action.payload
    };
  }
  return state;
};

export default reducer;

import { none, some } from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";

import { PagopaToken } from "../../../types/pagopa";

import { Action } from "../../actions/types";
import {
  pagoPaTokenFailure,
  pagoPaTokenRequest,
  pagoPaTokenSuccess
} from "../../actions/wallet/pagopa";
import { GlobalState } from "../types";

interface NoToken {
  kind: "NotRequested";
}

export type PagoPaState =
  | NoToken
  | { kind: "Requesting" }
  | { kind: "Success"; token: PagopaToken }
  | { kind: "Failure" };

const PAGOPA_INITIAL_STATE: NoToken = {
  kind: "NotRequested"
};

function matchPagoPaState<O>(
  state: PagoPaState,
  whenNotRequested: () => O,
  whenRequesting: () => O,
  whenSuccess: (token: PagopaToken) => O,
  whenFailure: () => O
) {
  switch (state.kind) {
    case "NotRequested":
      return whenNotRequested();

    case "Requesting":
      return whenRequesting();

    case "Success":
      return whenSuccess(state.token);

    case "Failure":
      return whenFailure();
  }
}

export const getPagoPaToken = (state: GlobalState) =>
  matchPagoPaState(
    state.wallet.pagoPa,
    () => none,
    () => none,
    token => some(token),
    () => none
  );

export const isRequestingPagoPaTokenSelector = (state: GlobalState) =>
  matchPagoPaState(
    state.wallet.pagoPa,
    () => false,
    () => true,
    () => false,
    () => false
  );

const reducer = (
  state: PagoPaState = PAGOPA_INITIAL_STATE,
  action: Action
): PagoPaState => {
  switch (action.type) {
    case getType(pagoPaTokenRequest):
      return { kind: "Requesting" };

    case getType(pagoPaTokenSuccess):
      return { kind: "Success", token: action.payload };

    case getType(pagoPaTokenFailure):
      return { kind: "Failure" };

    default:
      return state;
  }
};

export default reducer;

import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { NetworkError } from "../../../../utils/errors";

import { Transaction } from "../../../../types/pagopa";
import { walletTransactionDetailsGet } from "./actions";

export type WalletTransactionState = {
  details: pot.Pot<Transaction, NetworkError>;
};

const INITIAL_STATE: WalletTransactionState = {
  details: pot.noneLoading
};

const walletTransactionReducer = (
  state: WalletTransactionState = INITIAL_STATE,
  action: Action
): WalletTransactionState => {
  switch (action.type) {
    // GET TRANSACTION DETAILS
    case getType(walletTransactionDetailsGet.request):
      return {
        ...state,
        details: pot.toLoading(pot.none)
      };
    case getType(walletTransactionDetailsGet.success):
      return {
        ...state,
        details: pot.some(action.payload)
      };
    case getType(walletTransactionDetailsGet.failure):
      return {
        ...state,
        details: pot.toError(state.details, action.payload)
      };
    case getType(walletTransactionDetailsGet.cancel):
      return {
        ...state,
        details: pot.none
      };
  }
  return state;
};

const walletTransactionSelector = (state: GlobalState) =>
  state.features.payments.transaction;

export const walletTransactionDetailsPotSelector = (state: GlobalState) =>
  walletTransactionSelector(state).details;

export default walletTransactionReducer;

import * as pot from "@pagopa/ts-commons/lib/pot";
import * as _ from "lodash";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { NetworkError } from "../../../../utils/errors";
import { GlobalState } from "../../../../store/reducers/types";

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
  state.features.wallet.transaction;

export const walletTransactionDetailsPotSelector = createSelector(
  walletTransactionSelector,
  transaction => transaction.details
);

export const walletTransactionDetailsSelector = createSelector(
  walletTransactionDetailsPotSelector,
  details =>
    pot.getOrElse(
      pot.map(details, el => el),
      null
    )
);

export const isLoadingTransactionDetailsSelector = createSelector(
  walletTransactionDetailsPotSelector,
  details => pot.isLoading(details)
);

export default walletTransactionReducer;

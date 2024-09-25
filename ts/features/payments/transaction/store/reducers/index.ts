import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";

import { Transaction } from "../../../../../types/pagopa";
import { getPaymentsTransactionDetailsAction } from "../actions";
import { IndexedById, toIndexed } from "../../../../../store/helpers/indexer";
import {
  fetchTransactionsFailure,
  fetchTransactionsRequest,
  fetchTransactionsRequestWithExpBackoff,
  fetchTransactionsSuccess
} from "../actions/legacyTransactionsActions";

export type PaymentsLegacyTransactionState = {
  details: pot.Pot<Transaction, NetworkError>;
  transactions: pot.Pot<IndexedById<Transaction>, Error>;
  total: pot.Pot<number, Error>;
};

const INITIAL_STATE: PaymentsLegacyTransactionState = {
  details: pot.noneLoading,
  transactions: pot.none,
  total: pot.none
};

const reducer = (
  state: PaymentsLegacyTransactionState = INITIAL_STATE,
  action: Action
): PaymentsLegacyTransactionState => {
  switch (action.type) {
    // GET TRANSACTION DETAILS
    case getType(getPaymentsTransactionDetailsAction.request):
      return {
        ...state,
        details: pot.toLoading(pot.none)
      };
    case getType(getPaymentsTransactionDetailsAction.success):
      return {
        ...state,
        details: pot.some(action.payload)
      };
    case getType(getPaymentsTransactionDetailsAction.failure):
      return {
        ...state,
        details: pot.toError(state.details, action.payload)
      };
    case getType(getPaymentsTransactionDetailsAction.cancel):
      return {
        ...state,
        details: pot.none
      };

    // FETCH LEGACY TRANSACTIONS
    case getType(fetchTransactionsRequestWithExpBackoff):
    case getType(fetchTransactionsRequest):
      return {
        ...state,
        transactions: pot.toLoading(state.transactions),
        total: pot.toLoading(state.total)
      };

    case getType(fetchTransactionsSuccess):
      const prevTransactions = pot.getOrElse<IndexedById<Transaction>>(
        state.transactions,
        {}
      );
      const total = {
        ...prevTransactions,
        ...toIndexed(action.payload.data, _ => _.id)
      };
      return {
        ...state,
        transactions: pot.some(total as IndexedById<Transaction>),
        total: pot.some(
          pipe(
            action.payload.total,
            O.fold(
              () => 0,
              s => s
            )
          )
        )
      };

    case getType(fetchTransactionsFailure):
      return {
        ...state,
        transactions: pot.toError(state.transactions, action.payload),
        total: pot.toError(state.total, action.payload)
      };
  }
  return state;
};

export default reducer;

import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";

import { Transaction } from "../../../../../types/pagopa";
import { getPaymentsTransactionDetailsAction } from "../actions";

export type PaymentsTransactionState = {
  details: pot.Pot<Transaction, NetworkError>;
};

const INITIAL_STATE: PaymentsTransactionState = {
  details: pot.noneLoading
};

const reducer = (
  state: PaymentsTransactionState = INITIAL_STATE,
  action: Action
): PaymentsTransactionState => {
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
  }
  return state;
};

export default reducer;

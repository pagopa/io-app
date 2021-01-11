import { fromNullable } from "fp-ts/lib/Option";
import { Millisecond } from "italia-ts-commons/lib/units";
import { getType } from "typesafe-actions";
import _ from "lodash";
import { PayloadAC } from "typesafe-actions/dist/type-helpers";
import { index } from "fp-ts/lib/Array";
import { Action } from "../../actions/types";
import {
  fetchTransactionsFailure,
  fetchTransactionsSuccess
} from "../../actions/wallet/transactions";
import {
  addWalletCreditCardFailure,
  addWalletCreditCardSuccess,
  fetchWalletsFailure,
  fetchWalletsSuccess,
  payCreditCardVerificationFailure,
  payCreditCardVerificationSuccess
} from "../../actions/wallet/wallets";
import { GlobalState } from "../types";
import { bpdLoadActivationStatus } from "../../../features/bonus/bpd/store/actions/details";
import { bpdPeriodsAmountLoad } from "../../../features/bonus/bpd/store/actions/periods";

/**
 * list of monitored actions
 * each entry is a tuple of 2
 * 0 - the failure action that is considered to create/increment the backoff delay
 * 1 - the success action that is considered to delete the previous backoff delay
 */
const monitoredActions: ReadonlyArray<[
  PayloadAC<any, any>,
  PayloadAC<any, any>
]> = [
  [payCreditCardVerificationFailure, payCreditCardVerificationSuccess],
  [addWalletCreditCardFailure, addWalletCreditCardSuccess],
  [fetchTransactionsFailure, fetchTransactionsSuccess],
  [fetchWalletsFailure, fetchWalletsSuccess],
  [bpdLoadActivationStatus.failure, bpdLoadActivationStatus.success],
  [bpdPeriodsAmountLoad.failure, bpdPeriodsAmountLoad.success]
];

const failureActions = monitoredActions.map(ma => ma[0]);
const successActions = monitoredActions.map(ma => ma[1]);

const failureActionTypes = failureActions.map(getType);
const successActionTypes = successActions.map(getType);
export type FailureActions = typeof failureActions[number];

export type LastRequestErrorState = {
  [key: string]: {
    lastUpdate: Date;
    attempts: number;
  };
};

const defaultState: LastRequestErrorState = {};
const backOffExpLimitAttempts = 4;
const backOffBase = 2;
const reducer = (
  state: LastRequestErrorState = defaultState,
  action: Action
): LastRequestErrorState => {
  const failure = failureActionTypes.find(a => a === action.type);

  if (failure) {
    return {
      ...state,
      [failure]: {
        lastUpdate: new Date(),
        attempts: Math.min(
          (state[failure]?.attempts ?? 0) + 1,
          backOffExpLimitAttempts
        )
      }
    };
  }
  const successIndex = successActionTypes.indexOf(action.type);
  const keyToRemove = index(successIndex, failureActionTypes);
  if (keyToRemove.isSome() && keyToRemove.value in state) {
    // remove the previous record
    return _.omit(state, keyToRemove.value);
  }
  return state;
};

// return the waiting time from a given failure action
export const backOffWaitingTime = (state: GlobalState) => (
  failure: FailureActions
): Millisecond =>
  fromNullable(state.wallet.lastRequestError[getType(failure)]).fold(
    0 as Millisecond,
    lastError => {
      const wait = Math.pow(backOffBase, lastError.attempts) * 1000;
      return (new Date().getTime() - lastError.lastUpdate.getTime() < wait
        ? wait
        : 0) as Millisecond;
    }
  );

export default reducer;

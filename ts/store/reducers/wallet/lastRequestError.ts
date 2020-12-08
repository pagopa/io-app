import { getType } from "typesafe-actions";
import { fromNullable } from "fp-ts/lib/Option";
import { Millisecond, Second } from "italia-ts-commons/lib/units";
import { Action } from "../../actions/types";
import {
  fetchWalletsFailure,
  fetchWalletsSuccess
} from "../../actions/wallet/wallets";
import {
  fetchTransactionsFailure,
  fetchTransactionsSuccess
} from "../../actions/wallet/transactions";
import { GlobalState } from "../types";

export type LastRequestErrorState = {
  lastUpdate?: Date;
  attempts: number;
};

const defaultState: LastRequestErrorState = { attempts: 0 };
const backOffExpLimit = 4 as Second;

const reducer = (
  state: LastRequestErrorState = defaultState,
  action: Action
): LastRequestErrorState => {
  switch (action.type) {
    case getType(fetchTransactionsFailure):
    case getType(fetchWalletsFailure):
      return {
        lastUpdate: new Date(),
        attempts: Math.min(state.attempts + 1, backOffExpLimit)
      };
    // on success reset state
    case getType(fetchTransactionsSuccess):
    case getType(fetchWalletsSuccess):
      return defaultState;
  }
  return state;
};

export const backOffWaitingTime = (state: GlobalState): Millisecond =>
  fromNullable(state.wallet.lastRequestError.lastUpdate).fold(
    0 as Millisecond,
    lu => {
      const wait = Math.pow(2, state.wallet.lastRequestError.attempts) * 1000;
      return (new Date().getTime() - lu.getTime() < wait
        ? wait
        : 0) as Millisecond;
    }
  );

export default reducer;

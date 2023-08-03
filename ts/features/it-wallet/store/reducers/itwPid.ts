import { getType } from "typesafe-actions";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { PidResponse } from "@pagopa/io-react-native-wallet/lib/typescript/pid/issuing";
import { Action } from "../../../../store/actions/types";
import { ItWalletError } from "../../utils/errors/itwErrors";
import { GlobalState } from "../../../../store/reducers/types";
import { itwPid } from "../actions/credentials";

export type ItwPidType = {
  pid: O.Option<PidResponse>;
};

export type ItwPidState = pot.Pot<ItwPidType, ItWalletError>;

const emptyState: ItwPidState = pot.none;

/**
 * This reducer handles the PID issuing state.
 * It manipulates a pot which maps to an error if the PID issuing faced an error.
 * A saga is attached to the request action which handles the PID issuing side effects.
 * @param state the current state
 * @param action the dispatched action
 * @returns the result state
 */
const reducer = (
  state: ItwPidState = emptyState,
  action: Action
): ItwPidState => {
  switch (action.type) {
    case getType(itwPid.request):
      return pot.toLoading(state);
    case getType(itwPid.success):
      return pot.some({
        pid: O.some(action.payload)
      });
    case getType(itwPid.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

/**
 * Selects the PID pod state from the global state.
 * @param state - the global state
 * @returns the PID pot state.
 */
export const itwPidSelector = (state: GlobalState) =>
  state.features.itWallet.pid;

/**
 * Selects the PID value from the global state.
 * @param state - the global state
 * @returns the pid value.
 */
export const itwPidValueSelector = (state: GlobalState) =>
  pot.getOrElse(
    pot.map(state.features.itWallet.pid, pid => pid.pid),
    O.none
  );

export default reducer;

import { getType } from "typesafe-actions";
import * as O from "fp-ts/lib/Option";
import { PidResponse } from "@pagopa/io-react-native-wallet/lib/typescript/pid/issuing";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { itwCredentialsAddPid } from "../actions/itwCredentialsActions";
import { ItWalletError } from "../../utils/errors/itwErrors";

/**
 * The type of credentials stored in the wallet.
 */
type ItwCredentialsType = {
  pid: O.Option<PidResponse>;
};

export type ItwCredentialsState = pot.Pot<ItwCredentialsType, ItWalletError>;

const emptyState: ItwCredentialsState = pot.none;

/**
 * This reducer handles the credentials state.
 * Currently it only handles adding the PID to the wallet.
 * A saga is attached to the itwCredentialsAddPid action which handles the PID issuing.
 * @param state the current state
 * @param action the dispatched action
 * @returns the result state
 */
const reducer = (
  state: ItwCredentialsState = emptyState,
  action: Action
): ItwCredentialsState => {
  switch (action.type) {
    case getType(itwCredentialsAddPid.request):
      return pot.toLoading(state);
    case getType(itwCredentialsAddPid.success):
      return pot.some({ ...state, pid: O.some(action.payload) });
    case getType(itwCredentialsAddPid.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

/**
 * Selects the credentials state of the wallet.
 * @param state - the global state
 * @returns the credentials pot state of the wallet.
 */
export const ItwCredentialsStateSelector = (state: GlobalState) =>
  state.features.itWallet.credentials;

/**
 * Selects the PID stored in the wallet.
 * @param state - the global state
 * @returns the PID from the wallet.
 */
export const ItwCredentialsPidSelector = (state: GlobalState) =>
  pot.getOrElse(
    pot.map(
      state.features.itWallet.credentials,
      credentials => credentials.pid
    ),
    O.none
  );

export default reducer;

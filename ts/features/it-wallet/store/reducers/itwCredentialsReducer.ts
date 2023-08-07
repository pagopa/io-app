import { getType } from "typesafe-actions";
import * as O from "fp-ts/lib/Option";
import { PidResponse } from "@pagopa/io-react-native-wallet/lib/typescript/pid/issuing";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { itwCredentialsAddPid } from "../actions/itwCredentialsActions";

type ItwCredentialsType = {
  pid: O.Option<PidResponse>;
};

export type ItwCredentialsState = ItwCredentialsType;

const emptyState: ItwCredentialsState = { pid: O.none };

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
      return {
        ...state
      };
    case getType(itwCredentialsAddPid.success):
      return {
        ...state,
        pid: O.some(action.payload)
      };
    case getType(itwCredentialsAddPid.failure):
      return {
        ...state,
        pid: O.none
      };
  }
  return state;
};

/**
 * Selects the PID stored in the wallet.
 * @param state - the global state
 * @returns the PID from the wallet.
 */
export const ItwCredentialsPidSelector = (state: GlobalState) =>
  state.features.itWallet.credentials.pid;

export default reducer;

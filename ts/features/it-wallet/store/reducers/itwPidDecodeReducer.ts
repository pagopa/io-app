import { getType } from "typesafe-actions";
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { PidWithToken } from "@pagopa/io-react-native-wallet/lib/typescript/pid/sd-jwt";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { itwDecodePid } from "../actions/itwCredentialsActions";
import { ItWalletError } from "../../utils/itwErrorsUtils";
import { itwLifecycleOperational } from "../actions/itwLifecycleActions";

type ItwDecodedPidType = {
  decodedPid: O.Option<PidWithToken>;
};

export type ItwDecodedPidState = pot.Pot<ItwDecodedPidType, ItWalletError>;

const emptyState: ItwDecodedPidState = pot.none;

/**
 * This reducer handles the PID decoding.
 * A saga is attached to the itwDecodePid request action which handles the PID decoding.
 * @param state the current state
 * @param action the dispatched action
 * @returns the result state
 */
const reducer = (
  state: ItwDecodedPidState = emptyState,
  action: Action
): ItwDecodedPidState => {
  switch (action.type) {
    case getType(itwDecodePid.request):
      return pot.toLoading(state);
    case getType(itwDecodePid.success):
      return pot.some({ decodedPid: action.payload });
    case getType(itwDecodePid.failure):
      return pot.toError(state, action.payload);
    /**
     * Reset the state when the wallet is operational.
     */
    case getType(itwLifecycleOperational):
      return emptyState;
  }
  return state;
};

/**
 * Selects the decoded PID pot.
 * @param state - the global state
 * @returns the decoded PID pot from the wallet.
 */
export const ItwDecodedPidPotSelector = (state: GlobalState) =>
  state.features.itWallet.decodedPid;

/**
 * Selects the decode PID value from the pot.
 * @param state - the global state
 * @returns the decoded pid value if presente, O.none otherwise.
 */
export const itwDecodedPidValueSelector = (state: GlobalState) =>
  pot.getOrElse(
    pot.map(
      state.features.itWallet.decodedPid,
      decodedPid => decodedPid.decodedPid
    ),
    O.none
  );

export default reducer;

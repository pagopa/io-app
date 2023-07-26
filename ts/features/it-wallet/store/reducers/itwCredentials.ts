import { getType } from "typesafe-actions";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { PidResponse } from "@pagopa/io-react-native-wallet/lib/typescript/pid/issuing";
import { Action } from "../../../../store/actions/types";
import { itwCredentialsAddPid } from "../actions";
import { ItWalletError } from "../../utils/errors/itwErrors";
import { GlobalState } from "../../../../store/reducers/types";

type ItwCredentialsType = {
  pid: O.Option<PidResponse>;
};

export type ItwAttestationsState = pot.Pot<ItwCredentialsType, ItWalletError>;

const emptyState: ItwAttestationsState = pot.none;

/**
 * This reducer handles the requirements check for the IT Wallet activation.
 * It manipulates a pot which maps to an error if the requirements are not met or to true if they are.
 * A saga is attached to the request action to check the requirements.
 * @param state the current state
 * @param action the dispatched action
 * @returns the result state
 */
const reducer = (
  state: ItwAttestationsState = emptyState,
  action: Action
): ItwAttestationsState => {
  switch (action.type) {
    case getType(itwCredentialsAddPid.request):
      return pot.toLoading(state);
    case getType(itwCredentialsAddPid.success):
      return pot.some({
        pid: O.some(action.payload)
      });
    case getType(itwCredentialsAddPid.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

/**
 * Selects the itwallet state from the global state.
 * @param state - the global state
 * @returns the itwallet state.
 */
export const itwAttestationsSelector = (state: GlobalState) =>
  state.features.itWallet.attestations;

/**
 * Selects the itwallet vcs from the global state.
 * @param state - the global state
 * @returns the itwallet vcs flag.
 */
export const ItwWalletPidSelector = (state: GlobalState) =>
  pot.getOrElse(
    pot.map(state.features.itWallet.attestations, w => w.pid),
    O.none
  );

export default reducer;

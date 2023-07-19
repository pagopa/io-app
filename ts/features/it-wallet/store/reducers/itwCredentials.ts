import { getType } from "typesafe-actions";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Action } from "../../../../store/actions/types";
import { itwCredentialsAddPid, itwCredentialsReset } from "../actions";
import { PidMockType } from "../../utils/mocks";
import { ItWalletError } from "../../utils/errors/itwErrors";
import { GlobalState } from "../../../../store/reducers/types";

type ItwWalletType = {
  activated: boolean;
  vcs: Array<PidMockType>;
};

export type ItwWalletState = pot.Pot<ItwWalletType, ItWalletError>;

const emptyState: ItwWalletState = pot.none;

/**
 * This reducer handles the requirements check for the IT Wallet activation.
 * It manipulates a pot which maps to an error if the requirements are not met or to true if they are.
 * A saga is attached to the request action to check the requirements.
 * @param state the current state
 * @param action the dispatched action
 * @returns the result state
 */
const reducer = (
  state: ItwWalletState = emptyState,
  action: Action
): ItwWalletState => {
  switch (action.type) {
    case getType(itwCredentialsAddPid.request):
      return pot.toLoading(state);
    case getType(itwCredentialsAddPid.success):
      return pot.some({
        activated: true,
        vcs: [action.payload]
      });
    case getType(itwCredentialsAddPid.failure):
      return pot.toError(state, action.payload);
    case getType(itwCredentialsReset):
      return emptyState;
  }
  return state;
};

/**
 * Selects the itwallet state from the global state.
 * @param state - the global state
 * @returns the itwallet state.
 */
export const ItwWalletSelector = (state: GlobalState) =>
  state.features.itWallet.wallet;

/**
 * Selects the itwallet activated flag from the global state.
 * @param state - the global state
 * @returns the itwallet activated flag.
 */
export const ItwWalletActivatedSelector = (state: GlobalState) =>
  pot.getOrElse(
    pot.map(state.features.itWallet.wallet, w => w.activated),
    false
  );

/**
 * Selects the itwallet vcs from the global state.
 * @param state - the global state
 * @returns the itwallet vcs flag.
 */
export const ItwWalletVcsSelector = (state: GlobalState) =>
  pot.getOrElse(
    pot.map(state.features.itWallet.wallet, w => w.vcs),
    []
  );

export default reducer;

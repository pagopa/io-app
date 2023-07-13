import { getType } from "typesafe-actions";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import { Action } from "../../../../store/actions/types";
import { itwCredentialsAddPid } from "../actions";
import { PidMockType } from "../../utils/mocks";
import { ItWalletError } from "../../utils/errors/itwErrors";
import { GlobalState } from "../../../../store/reducers/types";

type ItwCredentialsType = {
  activated: boolean;
  vcs: Array<PidMockType>;
};

export type ItwCredentialsState = pot.Pot<ItwCredentialsType, ItWalletError>;

const emptyState: ItwCredentialsState = pot.none;

/**
 * This reducer handles the requirements check for the IT Wallet activation.
 * It manipulates a pot which maps to an error if the requirements are not met or to true if they are.
 * A saga is attached to the request action to check the requirements.
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
      return pot.some({
        activated: true,
        vcs: [action.payload]
      });
    case getType(itwCredentialsAddPid.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

export const ItwCredentialsSelector = (state: GlobalState) =>
  state.features.itWallet.credentials;

export const ItwCredentialsActivatedSelector = (state: GlobalState) =>
  pot.getOrElse(
    pot.map(state.features.itWallet.credentials, creds => creds.activated),
    false
  );

export default reducer;

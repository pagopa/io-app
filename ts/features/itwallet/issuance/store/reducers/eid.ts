import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { ItWalletError } from "../../../common/utils/itwErrorsUtils";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import { itwIssuanceEid } from "../actions/eid";

export type ItwIssuanceEidState = pot.Pot<
  O.Option<StoredCredential>,
  ItWalletError
>;

const INITIAL_STATE: ItwIssuanceEidState = pot.none;

/**
 * This reducer handles the PID issuing state.
 * It manipulates a pot which maps to an error if the PID issuing faced an error.
 * A saga is attached to the request action which handles the PID issuing side effects.
 * @param state the current state
 * @param action the dispatched action
 * @returns the result state
 */
const reducer = (
  state: ItwIssuanceEidState = INITIAL_STATE,
  action: Action
): ItwIssuanceEidState => {
  switch (action.type) {
    case getType(itwIssuanceEid.request):
      return pot.toLoading(state);
    case getType(itwIssuanceEid.success):
      return pot.some(action.payload);
    case getType(itwIssuanceEid.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

export default reducer;

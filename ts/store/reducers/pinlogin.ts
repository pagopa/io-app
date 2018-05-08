/**
 * A reducer for the Onboarding.
 * @flow
 */

import { Action } from "../../actions/types";
import { PIN_LOGIN_VALIDATE_FAILURE } from "../actions/constants";

export type PinLoginState = "PinConfirmedInvalid" | null;

export const INITIAL_STATE: Readonly<PinLoginState> = null;

// Selectors
const reducer = (
  state: PinLoginState = INITIAL_STATE,
  action: Action
): PinLoginState => {
  switch (action.type) {
    case PIN_LOGIN_VALIDATE_FAILURE:
      return "PinConfirmedInvalid";
    default:
      return state;
  }
};

export default reducer;

/**
 * A reducer for the PinLogin.
 */

import { PIN_LOGIN_VALIDATE_FAILURE } from "../actions/constants";
import { Action } from "../actions/types";

export type PinLoginState = Readonly<{
  PinConfirmed: "PinCheck" | "PinConfirmedInvalid";
}>;

export const INITIAL_STATE: PinLoginState = {
  PinConfirmed: "PinCheck"
};

const reducer = (
  state: PinLoginState = INITIAL_STATE,
  action: Action
): PinLoginState => {
  switch (action.type) {
    case PIN_LOGIN_VALIDATE_FAILURE:
      return {
        PinConfirmed: "PinConfirmedInvalid"
      };
    default:
      return state;
  }
};

export default reducer;

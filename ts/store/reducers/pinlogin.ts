/**
 * A reducer for the PinLogin.
 * @flow
 */

import { Action } from "../../actions/types";
import { PIN_LOGIN_VALIDATE_FAILURE } from "../actions/constants";

export type PinLoginState = Readonly<{
  PinConfirmed: string;
}>;

export const INITIAL_STATE: PinLoginState = {
  PinConfirmed: "PinConfirmedInvalid"
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

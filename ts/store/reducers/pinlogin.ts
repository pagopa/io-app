/**
 * A reducer for the PinLogin.
 */

import {
  PIN_LOGIN_VALIDATE_FAILURE,
  PIN_LOGIN_VALIDATE_SUCCESS
} from "../actions/constants";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type PinLoginState = Readonly<{
  PinConfirmed: "PinCheck" | "PinConfirmedInvalid" | "PinConfirmedValid";
}>;

export const INITIAL_STATE: PinLoginState = {
  PinConfirmed: "PinCheck"
};

export const isPinloginValidSelector = (state: GlobalState): boolean =>
  state.pinlogin.PinConfirmed === "PinConfirmedValid";

const reducer = (
  state: PinLoginState = INITIAL_STATE,
  action: Action
): PinLoginState => {
  switch (action.type) {
    case PIN_LOGIN_VALIDATE_SUCCESS:
      return {
        PinConfirmed: "PinConfirmedValid"
      };

    case PIN_LOGIN_VALIDATE_FAILURE:
      return {
        PinConfirmed: "PinConfirmedInvalid"
      };

    default:
      return state;
  }
};

export default reducer;

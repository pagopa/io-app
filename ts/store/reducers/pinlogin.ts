/**
 * A reducer for the PinLogin.
 */

import { getType } from "typesafe-actions";
import {
  pinLoginValidateFailure,
  pinLoginValidateSuccess
} from "../actions/pinlogin";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type PinLoginState = Readonly<{
  PinConfirmed: "PinCheck" | "PinConfirmedInvalid" | "PinConfirmedValid";
}>;

const INITIAL_STATE: PinLoginState = {
  PinConfirmed: "PinCheck"
};

export const isPinLoginValidSelector = (state: GlobalState): boolean =>
  state.pinlogin.PinConfirmed === "PinConfirmedValid";

const reducer = (
  state: PinLoginState = INITIAL_STATE,
  action: Action
): PinLoginState => {
  switch (action.type) {
    case getType(pinLoginValidateSuccess):
      return {
        PinConfirmed: "PinConfirmedValid"
      };

    case getType(pinLoginValidateFailure):
      return {
        PinConfirmed: "PinConfirmedInvalid"
      };

    default:
      return state;
  }
};

export default reducer;

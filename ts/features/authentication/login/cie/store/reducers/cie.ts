/**
 * A reducer for the authentication by CIE
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { cieIsSupported, nfcIsEnabled } from "../actions";
import { Action } from "../../../../../../store/actions/types";

export type CieState = {
  isCieSupported: pot.Pot<boolean, Error>;
  isNfcEnabled: pot.Pot<boolean, Error>;
};

const INITIAL_STATE: CieState = {
  isCieSupported: pot.none,
  isNfcEnabled: pot.none
};

export function cieReducer(
  state: CieState = INITIAL_STATE,
  action: Action
): CieState {
  switch (action.type) {
    case getType(cieIsSupported.success):
      return {
        ...state,
        isCieSupported: pot.some(action.payload)
      };
    case getType(cieIsSupported.failure):
      return {
        ...state,
        isCieSupported: pot.toError(state.isCieSupported, action.payload)
      };
    case getType(nfcIsEnabled.success):
      return {
        ...state,
        isNfcEnabled: pot.some(action.payload)
      };
    case getType(nfcIsEnabled.failure):
      return {
        ...state,
        isNfcEnabled: pot.toError(state.isNfcEnabled, action.payload)
      };

    default:
      return state;
  }
}

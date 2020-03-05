/**
 * A reducer for the authentication by CIE
 */
import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import {
  cieIsSupported,
  nfcIsEnabled,
  updateReadingState
} from "../actions/cie";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type CieState = {
  isCieSupported: pot.Pot<boolean, Error>;
  isNfcEnabled: pot.Pot<boolean, Error>;
  readingEvent: pot.Pot<string, Error>;
};

const INITIAL_STATE: CieState = {
  isCieSupported: pot.none,
  isNfcEnabled: pot.none,
  readingEvent: pot.none
};

export default function cieReducer(
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

    case getType(updateReadingState.success):
      return {
        ...state,
        readingEvent: pot.some(action.payload)
      };
    case getType(updateReadingState.failure):
      return {
        ...state,
        readingEvent: pot.toError(state.readingEvent, action.payload)
      };

    default:
      return state;
  }
}

// Selectors
export const isCieSupportedSelector = (state: GlobalState) =>
  state.cie.isCieSupported;

export const isNfcEnabledSelector = (state: GlobalState) =>
  state.cie.isNfcEnabled;

export const readingEventSelector = (state: GlobalState) =>
  state.cie.readingEvent;

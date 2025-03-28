/**
 * A reducer for the authentication by CIE
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import {
  cieIsSupported,
  hasApiLevelSupport,
  hasNFCFeature,
  nfcIsEnabled,
  updateReadingState
} from "../actions";
import { Action } from "../../../../../../store/actions/types";

export type CieState = {
  hasApiLevelSupport: pot.Pot<boolean, Error>;
  hasNFCFeature: pot.Pot<boolean, Error>;
  isCieSupported: pot.Pot<boolean, Error>;
  isNfcEnabled: pot.Pot<boolean, Error>;
  readingEvent: pot.Pot<string, Error>;
};

const INITIAL_STATE: CieState = {
  hasApiLevelSupport: pot.none,
  hasNFCFeature: pot.none,
  isCieSupported: pot.none,
  isNfcEnabled: pot.none,
  readingEvent: pot.none
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
    case getType(hasApiLevelSupport.success):
      return {
        ...state,
        hasApiLevelSupport: pot.some(action.payload)
      };
    case getType(hasApiLevelSupport.failure):
      return {
        ...state,
        hasApiLevelSupport: pot.toError(
          state.hasApiLevelSupport,
          action.payload
        )
      };
    case getType(hasNFCFeature.success):
      return {
        ...state,
        hasNFCFeature: pot.some(action.payload)
      };
    case getType(hasNFCFeature.failure):
      return {
        ...state,
        hasNFCFeature: pot.toError(state.hasNFCFeature, action.payload)
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

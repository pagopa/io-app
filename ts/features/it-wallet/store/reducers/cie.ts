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
} from "../actions/cie";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";

export type ItwCieState = {
  hasApiLevelSupport: pot.Pot<boolean, Error>;
  hasNFCFeature: pot.Pot<boolean, Error>;
  isCieSupported: pot.Pot<boolean, Error>;
  isNfcEnabled: pot.Pot<boolean, Error>;
  readingEvent: pot.Pot<string, Error>;
};

const INITIAL_STATE: ItwCieState = {
  hasApiLevelSupport: pot.none,
  hasNFCFeature: pot.none,
  isCieSupported: pot.none,
  isNfcEnabled: pot.none,
  readingEvent: pot.none
};

export default function itwCieReducer(
  state: ItwCieState = INITIAL_STATE,
  action: Action
): ItwCieState {
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

// Selectors
export const hasNFCFeatureSelector = (state: GlobalState) =>
  state.features.itWallet.activation.hasNFCFeature;

export const hasApiLevelSupportSelector = (state: GlobalState) =>
  state.features.itWallet.activation.hasApiLevelSupport;

export const isCieSupportedSelector = (state: GlobalState) =>
  state.features.itWallet.activation.isCieSupported;

export const isNfcEnabledSelector = (state: GlobalState) =>
  state.features.itWallet.activation.isNfcEnabled;

export const readingEventSelector = (state: GlobalState) =>
  state.features.itWallet.activation.readingEvent;

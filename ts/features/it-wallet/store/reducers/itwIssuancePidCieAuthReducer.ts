/**
 * A reducer for the authentication by CIE
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  itwCieIsSupported,
  itwHasApiLevelSupport,
  itwHasNFCFeature,
  itwNfcIsEnabled,
  itwUpdateReadingState
} from "../actions/itwIssuancePidCieActions";

export type ItwIssuancePidCieAuthState = {
  itwHasApiLevelSupport: pot.Pot<boolean, Error>;
  itwHasNFCFeature: pot.Pot<boolean, Error>;
  isCieSupported: pot.Pot<boolean, Error>;
  isNfcEnabled: pot.Pot<boolean, Error>;
  readingEvent: pot.Pot<string, Error>;
};

const INITIAL_STATE: ItwIssuancePidCieAuthState = {
  itwHasApiLevelSupport: pot.none,
  itwHasNFCFeature: pot.none,
  isCieSupported: pot.none,
  isNfcEnabled: pot.none,
  readingEvent: pot.none
};

export default function itwIssuancePidAuthCieReducer(
  state: ItwIssuancePidCieAuthState = INITIAL_STATE,
  action: Action
): ItwIssuancePidCieAuthState {
  switch (action.type) {
    case getType(itwCieIsSupported.success):
      return {
        ...state,
        isCieSupported: pot.some(action.payload)
      };
    case getType(itwCieIsSupported.failure):
      return {
        ...state,
        isCieSupported: pot.toError(state.isCieSupported, action.payload)
      };
    case getType(itwHasApiLevelSupport.success):
      return {
        ...state,
        itwHasApiLevelSupport: pot.some(action.payload)
      };
    case getType(itwHasApiLevelSupport.failure):
      return {
        ...state,
        itwHasApiLevelSupport: pot.toError(
          state.itwHasApiLevelSupport,
          action.payload
        )
      };
    case getType(itwHasNFCFeature.success):
      return {
        ...state,
        itwHasNFCFeature: pot.some(action.payload)
      };
    case getType(itwHasNFCFeature.failure):
      return {
        ...state,
        itwHasNFCFeature: pot.toError(state.itwHasNFCFeature, action.payload)
      };
    case getType(itwNfcIsEnabled.success):
      return {
        ...state,
        isNfcEnabled: pot.some(action.payload)
      };
    case getType(itwNfcIsEnabled.failure):
      return {
        ...state,
        isNfcEnabled: pot.toError(state.isNfcEnabled, action.payload)
      };

    case getType(itwUpdateReadingState.success):
      return {
        ...state,
        readingEvent: pot.some(action.payload)
      };
    case getType(itwUpdateReadingState.failure):
      return {
        ...state,
        readingEvent: pot.toError(state.readingEvent, action.payload)
      };

    default:
      return state;
  }
}

// Selectors
export const itwHasNFCFeatureSelector = (state: GlobalState) =>
  state.features.itWallet.issuancePidCieAuth.itwHasNFCFeature;

export const itwHasApiLevelSupportSelector = (state: GlobalState) =>
  state.features.itWallet.issuancePidCieAuth.itwHasApiLevelSupport;

export const itwIsCieSupportedSelector = (state: GlobalState) =>
  state.features.itWallet.issuancePidCieAuth.isCieSupported;

export const itwIsNfcEnabledSelector = (state: GlobalState) =>
  state.features.itWallet.issuancePidCieAuth.isNfcEnabled;

export const itwReadingEventSelector = (state: GlobalState) =>
  state.features.itWallet.issuancePidCieAuth.readingEvent;

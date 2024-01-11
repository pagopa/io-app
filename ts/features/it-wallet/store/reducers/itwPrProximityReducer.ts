/**
 * A reducer for proximity
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  hasBLEFeature,
  bleIsEnabled,
  generateQrCode,
  proximityManagerStatus,
  ProximityManagerStatusEnum
} from "../actions/itwProximityActions";
import { ItWalletError } from "../../utils/itwErrorsUtils";

export type ItwPrProximityState = {
  hasBLEFeature: pot.Pot<boolean, ItWalletError>;
  isBleEnabled: pot.Pot<boolean, ItWalletError>;
  qrCode: pot.Pot<string, ItWalletError>;
  readingEvent: pot.Pot<string, ItWalletError>;
  status: pot.Pot<ProximityManagerStatusEnum, ItWalletError>;
};

const INITIAL_STATE: ItwPrProximityState = {
  hasBLEFeature: pot.none,
  isBleEnabled: pot.none,
  qrCode: pot.none,
  readingEvent: pot.none,
  status: pot.none
};

export default function itwPrProximityReducer(
  state: ItwPrProximityState = INITIAL_STATE,
  action: Action
): ItwPrProximityState {
  switch (action.type) {
    case getType(proximityManagerStatus):
      return {
        ...state,
        status: pot.some(action.payload.status)
      };
    case getType(hasBLEFeature.success):
      return {
        ...state,
        hasBLEFeature: pot.some(action.payload)
      };
    case getType(hasBLEFeature.failure):
      return {
        ...state,
        hasBLEFeature: pot.toError(state.hasBLEFeature, action.payload)
      };
    case getType(bleIsEnabled.success):
      return {
        ...state,
        isBleEnabled: pot.some(action.payload)
      };
    case getType(bleIsEnabled.failure):
      return {
        ...state,
        isBleEnabled: pot.toError(state.isBleEnabled, action.payload)
      };
    case getType(generateQrCode.success):
      return {
        ...state,
        qrCode: pot.some(action.payload)
      };

    default:
      return state;
  }
}

// Selectors
export const itwPrProximityHasBLEFeatureSelector = (state: GlobalState) =>
  state.features.itWallet.prProximity.hasBLEFeature;

export const itwPrProximitySelector = (state: GlobalState) =>
  pot.getOrElse(
    pot.map(state.features.itWallet.prProximity.status, status => status),
    ProximityManagerStatusEnum.STOPPED
  );

export const itwPrProximityIsBleEnabledSelector = (state: GlobalState) =>
  state.features.itWallet.prProximity.isBleEnabled;

export const itwPrProximityQrCodeSelector = (state: GlobalState) =>
  state.features.itWallet.prProximity.qrCode;

/**
 * A reducer for the authentication by CIE
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

export type ItwProximityState = {
  hasBLEFeature: pot.Pot<boolean, Error>;
  isBleEnabled: pot.Pot<boolean, Error>;
  qrCode: pot.Pot<string, Error>;
  readingEvent: pot.Pot<string, Error>;
  status: pot.Pot<ProximityManagerStatusEnum, Error>;
};

const INITIAL_STATE: ItwProximityState = {
  hasBLEFeature: pot.none,
  isBleEnabled: pot.none,
  qrCode: pot.none,
  readingEvent: pot.none,
  status: pot.none
};

export default function itwProximityReducer(
  state: ItwProximityState = INITIAL_STATE,
  action: Action
): ItwProximityState {
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
export const hasBLEFeatureSelector = (state: GlobalState) =>
  state.features.itWallet.proximity.hasBLEFeature;

export const proximityStatusSelector = (state: GlobalState) =>
  pot.getOrElse(
    pot.map(state.features.itWallet.proximity.status, status => status),
    ProximityManagerStatusEnum.STOPPED
  );

export const isBleEnabledSelector = (state: GlobalState) =>
  state.features.itWallet.proximity.isBleEnabled;

export const qrcodeSelector = (state: GlobalState) =>
  state.features.itWallet.proximity.qrCode;

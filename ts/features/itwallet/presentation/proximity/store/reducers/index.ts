import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import createSecureStorage from "../../../../../../store/storages/secureStorage";
import { Action } from "../../../../../../store/actions/types";
import {
  itwGrantProximityConsent,
  itwRevokeProximityConsent
} from "../actions";
import { itwLifecycleStoresReset } from "../../../../lifecycle/store/actions";

export type ItwProximityState = {
  consents: any; // TODO define the type of consents
};

export const itwProximityInitialState: ItwProximityState = {
  consents: {}
};

const reducer = (
  state: ItwProximityState = itwProximityInitialState,
  action: Action
): ItwProximityState => {
  switch (action.type) {
    case getType(itwGrantProximityConsent): {
      return {
        ...state,
        consents: {} // TODO add the new consent to the store instead of resetting it entirely
      };
    }

    case getType(itwRevokeProximityConsent): {
      return {
        ...state,
        consents: {} // TODO remove the consent from the store instead of resetting it entirely
      };
    }

    case getType(itwLifecycleStoresReset):
      return itwProximityInitialState;

    default:
      return state;
  }
};

const CURRENT_REDUX_ITW_PROXIMITY_STORE_VERSION = -1;

const itwProximityPersistConfig: PersistConfig = {
  key: "itwProximity",
  storage: createSecureStorage(),
  version: CURRENT_REDUX_ITW_PROXIMITY_STORE_VERSION
};

const persistedReducer = persistReducer(itwProximityPersistConfig, reducer);

export default persistedReducer;

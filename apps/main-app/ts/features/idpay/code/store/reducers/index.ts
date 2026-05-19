import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { PersistConfig, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";
import {
  idPayCodeCieBannerClose,
  idPayEnrollCode,
  idPayGenerateCode,
  idPayGetCodeStatus,
  idPayResetCode
} from "../actions";

export type IdPayCodeState = {
  isOnboarded: pot.Pot<boolean, NetworkError>;
  code: pot.Pot<string, NetworkError>;
  enrollmentRequest: pot.Pot<void, NetworkError>;
  isIdPayInitiativeBannerClosed: Record<string, boolean>;
};

const INITIAL_STATE: IdPayCodeState = {
  isOnboarded: pot.none,
  code: pot.none,
  enrollmentRequest: pot.none,
  isIdPayInitiativeBannerClosed: {}
};

const reducer = (
  state: IdPayCodeState = INITIAL_STATE,
  action: Action
): IdPayCodeState => {
  switch (action.type) {
    case getType(idPayGetCodeStatus.request):
      return {
        ...state,
        isOnboarded: pot.toLoading(state.isOnboarded)
      };
    case getType(idPayGetCodeStatus.success):
      if (action.payload.isIdPayCodeEnabled !== undefined) {
        return {
          ...state,
          isOnboarded: pot.some(action.payload.isIdPayCodeEnabled)
        };
      }
      return {
        ...state,
        isOnboarded: pot.none
      };
    case getType(idPayGetCodeStatus.failure):
      return {
        ...state,
        isOnboarded: pot.toError(state.isOnboarded, action.payload)
      };

    case getType(idPayGenerateCode.request):
      return {
        ...state,
        code: pot.toLoading(state.code)
      };
    case getType(idPayGenerateCode.success):
      if (action.payload.idpayCode !== undefined) {
        return {
          ...state,
          code: pot.some(action.payload.idpayCode),
          isOnboarded: pot.some(true)
        };
      }
      return {
        ...state,
        code: pot.none
      };
    case getType(idPayGenerateCode.failure):
      return {
        ...state,
        code: pot.toError(state.code, action.payload)
      };

    case getType(idPayEnrollCode.request):
      return {
        ...state,
        enrollmentRequest: pot.toLoading(state.enrollmentRequest)
      };
    case getType(idPayEnrollCode.success):
      return {
        ...state,
        enrollmentRequest: pot.some(undefined)
      };
    case getType(idPayEnrollCode.failure):
      return {
        ...state,
        enrollmentRequest: pot.toError(state.enrollmentRequest, action.payload)
      };

    case getType(idPayResetCode):
      return {
        ...state,
        code: pot.none
      };
    case getType(idPayCodeCieBannerClose):
      return {
        ...state,
        isIdPayInitiativeBannerClosed: {
          [action.payload.initiativeId]: true
        }
      };
  }
  return state;
};

const CURRENT_REDUX_FEATURES_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "code",
  storage: AsyncStorage,
  version: CURRENT_REDUX_FEATURES_STORE_VERSION,
  whitelist: ["isIdPayInitiativeBannerClosed"]
};

const idPayCodePersistor = persistReducer<IdPayCodeState, Action>(
  persistConfig,
  reducer
);

export default idPayCodePersistor;

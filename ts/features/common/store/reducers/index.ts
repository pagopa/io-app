import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";
import { PersistConfig, PersistPartial, persistReducer } from "redux-persist";

import { Action } from "../../../../store/actions/types";
import {
  euCovidCertReducer,
  EuCovidCertState
} from "../../../euCovidCert/store/reducers";
import { PnState, pnReducer } from "../../../pn/store/reducers";
import fciReducer, { FciState } from "../../../fci/store/reducers";
import idPayReducer, { IDPayState } from "../../../idpay/common/store/reducers";
import {
  testLoginReducer,
  TestLoginState
} from "../../../../store/reducers/testLogin";
import {
  fastLoginReducer,
  FastLoginState
} from "../../../fastLogin/store/reducers";
import {
  nativeLoginReducer,
  NativeLoginState
} from "../../../nativeLogin/store/reducers";

type LoginFeaturesState = {
  testLogin: TestLoginState;
  nativeLogin: NativeLoginState;
  fastLogin: FastLoginState;
};

export type FeaturesState = {
  euCovidCert: EuCovidCertState;
  pn: PnState;
  fci: FciState;
  idPay: IDPayState;
  loginFeatures: LoginFeaturesState;
};

export type PersistedFeaturesState = FeaturesState & PersistPartial;

const rootReducer = combineReducers<FeaturesState, Action>({
  euCovidCert: euCovidCertReducer,
  pn: pnReducer,
  fci: fciReducer,
  idPay: idPayReducer,
  loginFeatures: combineReducers<LoginFeaturesState, Action>({
    testLogin: testLoginReducer,
    nativeLogin: nativeLoginReducer,
    fastLogin: fastLoginReducer
  })
});

const CURRENT_REDUX_FEATURES_STORE_VERSION = 1;

const persistConfig: PersistConfig = {
  key: "features",
  storage: AsyncStorage,
  version: CURRENT_REDUX_FEATURES_STORE_VERSION,
  // we let each vertical manage its own lists by banning everything else
  whitelist: []
};

export const featuresPersistor = persistReducer<FeaturesState, Action>(
  persistConfig,
  rootReducer
);

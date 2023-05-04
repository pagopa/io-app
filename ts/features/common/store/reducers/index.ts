import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";
import { PersistConfig, PersistPartial, persistReducer } from "redux-persist";

import { Action } from "../../../../store/actions/types";
import {
  euCovidCertReducer,
  EuCovidCertState
} from "../../../euCovidCert/store/reducers";
import { mvlReducer, MvlState } from "../../../mvl/store/reducers";
import { PersistedPnState, pnPersistor } from "../../../pn";
import fciReducer, { FciState } from "../../../fci/store/reducers";
import idPayReducer, { IDPayState } from "../../../idpay/common/store/reducers";
import {
  testLoginReducer,
  TestLoginState
} from "../../../../store/reducers/testLogin";
import { nativeLoginReducer, NativeLoginState } from "../../../../store/reducers/nativeLogin";

type LoginFeaturesState = {
  testLogin: TestLoginState;
  nativeLogin: NativeLoginState;
};

export type FeaturesState = {
  euCovidCert: EuCovidCertState;
  mvl: MvlState;
  pn: PersistedPnState;
  fci: FciState;
  idPay: IDPayState;
  loginFeatures: LoginFeaturesState;
};

export type PersistedFeaturesState = FeaturesState & PersistPartial;

const rootReducer = combineReducers<FeaturesState, Action>({
  euCovidCert: euCovidCertReducer,
  mvl: mvlReducer,
  pn: pnPersistor,
  fci: fciReducer,
  idPay: idPayReducer,
  loginFeatures: combineReducers<LoginFeaturesState,Action>({
    testLogin: testLoginReducer,
    nativeLogin: nativeLoginReducer
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

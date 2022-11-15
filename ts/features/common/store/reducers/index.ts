import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";
import { PersistConfig, PersistPartial, persistReducer } from "redux-persist";

import { Action } from "../../../../store/actions/types";
import {
  euCovidCertReducer,
  EuCovidCertState
} from "../../../euCovidCert/store/reducers";
import { mvlPersistor, PersistedMvlState } from "../../../mvl";
import { PersistedPnState, pnPersistor } from "../../../pn";
import fciReducer, { FciState } from "../../../fci/store/reducers";
import idPayWalletReducer, {
  IDPayWalletState
} from "../../../idpay/wallet/store/reducers";

export type FeaturesState = {
  euCovidCert: EuCovidCertState;
  mvl: PersistedMvlState;
  pn: PersistedPnState;
  fci: FciState;
  idPayWallet: IDPayWalletState;
};

export type PersistedFeaturesState = FeaturesState & PersistPartial;

const rootReducer = combineReducers<FeaturesState, Action>({
  euCovidCert: euCovidCertReducer,
  mvl: mvlPersistor,
  pn: pnPersistor,
  fci: fciReducer,
  idPayWallet: idPayWalletReducer
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

import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";
import { PersistConfig, PersistPartial, persistReducer } from "redux-persist";
import { Action } from "../../../../store/actions/types";
import {
  TestLoginState,
  testLoginReducer
} from "../../../../store/reducers/testLogin";
import {
  CieLoginState,
  cieLoginReducer
} from "../../../cieLogin/store/reducers";
import {
  EuCovidCertState,
  euCovidCertReducer
} from "../../../euCovidCert/store/reducers";
import {
  FastLoginState,
  fastLoginReducer
} from "../../../fastLogin/store/reducers";
import fciReducer, { FciState } from "../../../fci/store/reducers";
import fimsReducer, { FimsState } from "../../../fims/common/store/reducer";
import idPayReducer, { IDPayState } from "../../../idpay/common/store/reducers";
import itWalletReducer, {
  ItWalletState
} from "../../../itwallet/common/store/reducers";
import {
  NativeLoginState,
  nativeLoginReducer
} from "../../../nativeLogin/store/reducers";
import walletReducer, { WalletState } from "../../../newWallet/store/reducers";
import paymentsReducer, {
  PaymentsState
} from "../../../payments/common/store/reducers";
import { PnState, pnReducer } from "../../../pn/store/reducers";
import {
  ProfileSettingsState,
  profileSettingsReducerPersistor
} from "../../../profileSettings/store/reducers";
import servicesReducer, {
  ServicesState
} from "../../../services/common/store/reducers";
import {
  WhatsNewState,
  whatsNewPersistor
} from "../../../whatsnew/store/reducers";

type LoginFeaturesState = {
  testLogin: TestLoginState;
  nativeLogin: NativeLoginState;
  fastLogin: FastLoginState;
  cieLogin: CieLoginState;
};

export type FeaturesState = {
  euCovidCert: EuCovidCertState;
  pn: PnState;
  fci: FciState;
  idPay: IDPayState;
  whatsNew: WhatsNewState & PersistPartial;
  loginFeatures: LoginFeaturesState;
  payments: PaymentsState;
  services: ServicesState;
  wallet: WalletState;
  fims: FimsState;
  itWallet: ItWalletState;
  profileSettings: ProfileSettingsState & PersistPartial;
};

export type PersistedFeaturesState = FeaturesState & PersistPartial;

const rootReducer = combineReducers<FeaturesState, Action>({
  euCovidCert: euCovidCertReducer,
  pn: pnReducer,
  fci: fciReducer,
  idPay: idPayReducer,
  payments: paymentsReducer,
  services: servicesReducer,
  whatsNew: whatsNewPersistor,
  loginFeatures: combineReducers<LoginFeaturesState, Action>({
    testLogin: testLoginReducer,
    nativeLogin: nativeLoginReducer,
    fastLogin: fastLoginReducer,
    cieLogin: cieLoginReducer
  }),
  wallet: walletReducer,
  fims: fimsReducer,
  itWallet: itWalletReducer,
  profileSettings: profileSettingsReducerPersistor
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

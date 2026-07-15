import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";
import { PersistConfig, PersistPartial, persistReducer } from "redux-persist";

import { Action } from "../../../../store/actions/types";
import {
  appearanceSettingsReducerPersistor,
  AppearanceSettingsState
} from "../../../appearanceSettings/store/reducers";
import {
  appFeedbackPersistor,
  AppFeedbackState
} from "../../../appReviews/store/reducers";
import {
  activeSessionLoginPersistor,
  ActiveSessionLoginState
} from "../../../authentication/activeSessionLogin/store/reducer";
import {
  testLoginReducer,
  TestLoginState
} from "../../../authentication/common/store/reducers/testLogin";
import {
  fastLoginReducer,
  FastLoginState
} from "../../../authentication/fastLogin/store/reducers";
import {
  cieLoginPersistor,
  CieLoginState
} from "../../../authentication/login/cie/store/reducers/cieLogin";
import {
  spidLoginReducer,
  SpidLoginState
} from "../../../authentication/login/idp/store/reducers";
import {
  loginInfoReducer,
  LoginInfoState
} from "../../../authentication/loginInfo/store/reducers";
import cdcReducer, { CdcState } from "../../../bonus/cdc/common/store/reducers";
import connectivityStateReducer, {
  ConnectivityState
} from "../../../connectivity/store/reducers";
import fciReducer, { FciState } from "../../../fci/store/reducers";
import fimsReducer, { FimsState } from "../../../fims/common/store/reducer";
import idPayReducer, { IDPayState } from "../../../idpay/common/store/reducers";
import {
  ingressScreenReducer,
  IngressScreenState
} from "../../../ingress/store/reducer";
import itWalletReducer, {
  PersistedItWalletState
} from "../../../itwallet/common/store/reducers";
import {
  landingScreenBannersReducer,
  LandingScreenBannerState
} from "../../../landingScreenMultiBanner/store/reducer";
import {
  backgroundLinkingReducer,
  BackgroundLinkingState
} from "../../../linking/reducers";
import {
  mixpanelReducer,
  MixpanelState
} from "../../../mixpanel/store/reducer";
import paymentsReducer, {
  PaymentsState
} from "../../../payments/common/store/reducers";
import { pnReducer, PnState } from "../../../pn/store/reducers";
import {
  profileSettingsReducerPersistor,
  ProfileSettingsState
} from "../../../profileSettings/store/reducers";
import servicesReducer, {
  ServicesState
} from "../../../services/common/store/reducers";
import tourReducer, { TourState } from "../../../tour/store/reducers";
import { utmLinkReducer, UtmLinkState } from "../../../utmLink/store/reducers";
import walletReducer, { WalletState } from "../../../wallet/store/reducers";
import {
  whatsNewPersistor,
  WhatsNewState
} from "../../../whatsnew/store/reducers";

export type FeaturesState = {
  appearanceSettings: AppearanceSettingsState & PersistPartial;
  appFeedback: AppFeedbackState & PersistPartial;
  backgroundLinking: BackgroundLinkingState;
  cdc: CdcState;
  connectivityStatus: ConnectivityState;
  fci: FciState;
  fims: FimsState;
  idPay: IDPayState;
  ingress: IngressScreenState;
  itWallet: PersistedItWalletState;
  landingBanners: LandingScreenBannerState;
  loginFeatures: LoginFeaturesState;
  mixpanel: MixpanelState;
  payments: PaymentsState;
  pn: PnState;
  profileSettings: PersistPartial & ProfileSettingsState;
  services: ServicesState;
  tour: PersistPartial & TourState;
  utmLink: UtmLinkState;
  wallet: WalletState;
  whatsNew: PersistPartial & WhatsNewState;
};

export type PersistedFeaturesState = FeaturesState & PersistPartial;

type LoginFeaturesState = {
  activeSessionLogin: ActiveSessionLoginState & PersistPartial;
  cieLogin: CieLoginState & PersistPartial;
  fastLogin: FastLoginState;
  loginInfo: LoginInfoState;
  spidLogin: SpidLoginState;
  testLogin: TestLoginState;
};

const rootReducer = combineReducers<FeaturesState, Action>({
  pn: pnReducer,
  fci: fciReducer,
  idPay: idPayReducer,
  payments: paymentsReducer,
  services: servicesReducer,
  whatsNew: whatsNewPersistor,
  loginFeatures: combineReducers<LoginFeaturesState, Action>({
    testLogin: testLoginReducer,
    fastLogin: fastLoginReducer,
    cieLogin: cieLoginPersistor,
    loginInfo: loginInfoReducer,
    spidLogin: spidLoginReducer,
    activeSessionLogin: activeSessionLoginPersistor
  }),
  wallet: walletReducer,
  fims: fimsReducer,
  itWallet: itWalletReducer,
  profileSettings: profileSettingsReducerPersistor,
  appearanceSettings: appearanceSettingsReducerPersistor,
  mixpanel: mixpanelReducer,
  ingress: ingressScreenReducer,
  landingBanners: landingScreenBannersReducer,
  appFeedback: appFeedbackPersistor,
  utmLink: utmLinkReducer,
  connectivityStatus: connectivityStateReducer,
  backgroundLinking: backgroundLinkingReducer,
  cdc: cdcReducer,
  tour: tourReducer
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

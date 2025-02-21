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
  cieLoginPersistor
} from "../../../cieLogin/store/reducers";
import {
  FastLoginState,
  fastLoginReducer
} from "../../../fastLogin/store/reducers";
import fciReducer, { FciState } from "../../../fci/store/reducers";
import fimsReducer, { FimsState } from "../../../fims/common/store/reducer";
import idPayReducer, { IDPayState } from "../../../idpay/common/store/reducers";
import itWalletReducer, {
  PersistedItWalletState
} from "../../../itwallet/common/store/reducers";
import {
  NativeLoginState,
  nativeLoginReducer
} from "../../../nativeLogin/store/reducers";
import walletReducer, { WalletState } from "../../../wallet/store/reducers";
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
import {
  mixpanelReducer,
  MixpanelState
} from "../../../mixpanel/store/reducer";
import {
  ingressScreenReducer,
  IngressScreenState
} from "../../../ingress/store/reducer";
import {
  loginInfoReducer,
  LoginInfoState
} from "../../../login/info/store/reducers";
import {
  landingScreenBannersReducer,
  LandingScreenBannerState
} from "../../../landingScreenMultiBanner/store/reducer";
import {
  spidLoginReducer,
  SpidLoginState
} from "../../../spidLogin/store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { isIOMarkdownDisabledForMessagesAndServices } from "../../../../store/reducers/backendStatus/remoteConfig";
import { isIOMarkdownEnabledLocallySelector } from "../../../../store/reducers/persistedPreferences";
import {
  loginPreferencesPersistor,
  LoginPreferencesState
} from "../../../login/preferences/store/reducers";

type LoginFeaturesState = {
  testLogin: TestLoginState;
  nativeLogin: NativeLoginState;
  fastLogin: FastLoginState;
  cieLogin: CieLoginState & PersistPartial;
  loginInfo: LoginInfoState;
  spidLogin: SpidLoginState;
  loginPreferences: LoginPreferencesState & PersistPartial;
};

export type FeaturesState = {
  pn: PnState;
  fci: FciState;
  idPay: IDPayState;
  whatsNew: WhatsNewState & PersistPartial;
  loginFeatures: LoginFeaturesState;
  payments: PaymentsState;
  services: ServicesState;
  wallet: WalletState;
  fims: FimsState;
  itWallet: PersistedItWalletState;
  profileSettings: ProfileSettingsState & PersistPartial;
  mixpanel: MixpanelState;
  ingress: IngressScreenState;
  landingBanners: LandingScreenBannerState;
};

export type PersistedFeaturesState = FeaturesState & PersistPartial;

const rootReducer = combineReducers<FeaturesState, Action>({
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
    cieLogin: cieLoginPersistor,
    loginInfo: loginInfoReducer,
    spidLogin: spidLoginReducer,
    loginPreferences: loginPreferencesPersistor
  }),
  wallet: walletReducer,
  fims: fimsReducer,
  itWallet: itWalletReducer,
  profileSettings: profileSettingsReducerPersistor,
  mixpanel: mixpanelReducer,
  ingress: ingressScreenReducer,
  landingBanners: landingScreenBannersReducer
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

/**
 * This selector checks if IO Markdown has been disabled remotely
 * and if it has been enabled locally.
 * The remote flag is a way to disable IOMarkdown without relying
 * on a new app release.
 * @param state Redux global state
 * @returns true if IOMarkdown is enabled, false otherwise
 */
export const isIOMarkdownEnabledOnMessagesAndServicesSelector = (
  state: GlobalState
) =>
  !isIOMarkdownDisabledForMessagesAndServices(state) &&
  isIOMarkdownEnabledLocallySelector(state);

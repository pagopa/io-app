/**
 * Aggregates all defined reducers
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, Reducer } from "redux";
import { PersistConfig, persistReducer, purgeStoredState } from "redux-persist";
import { isActionOf } from "typesafe-actions";
import { versionInfoReducer } from "../../common/versionInfo/store/reducers/versionInfo";
import bonusReducer from "../../features/bonus/bonusVacanze/store/reducers";
import { featuresPersistor } from "../../features/common/store/reducers";
import { lollipopPersistor } from "../../features/lollipop/store";
import { initialLollipopState } from "../../features/lollipop/store/reducers/lollipop";
import {
  logoutFailure,
  logoutSuccess,
  sessionExpired
} from "../actions/authentication";
import { Action } from "../actions/types";
import createSecureStorage from "../storages/keychain";
import { DateISO8601Transform } from "../transforms/dateISO8601Tranform";
import appStateReducer from "./appState";
import assistanceToolsReducer from "./assistanceTools";
import authenticationReducer, {
  AuthenticationState,
  INITIAL_STATE as autenticationInitialState
} from "./authentication";
import backendStatusReducer from "./backendStatus";
import backoffErrorReducer from "./backoffError";
import cieReducer from "./cie";
import contentReducer, {
  initialContentState as contentInitialContentState
} from "./content";
import crossSessionsReducer from "./crossSessions";
import { debugReducer } from "./debug";
import emailValidationReducer from "./emailValidation";
import entitiesReducer, {
  entitiesPersistConfig,
  EntitiesState
} from "./entities";
import identificationReducer, {
  IdentificationState,
  INITIAL_STATE as identificationInitialState
} from "./identification";
import installationReducer from "./installation";
import { navigationReducer } from "./navigation";
import notificationsReducer from "./notifications";
import onboardingReducer from "./onboarding";
import paymentsReducer from "./payments";
import persistedPreferencesReducer, {
  initialPreferencesState
} from "./persistedPreferences";
import preferencesReducer from "./preferences";
import profileReducer from "./profile";
import searchReducer from "./search";
import startupReducer from "./startup";
import { GlobalState } from "./types";
import userDataProcessingReducer from "./userDataProcessing";
import userMetadataReducer from "./userMetadata";
import walletReducer from "./wallet";
import { WALLETS_INITIAL_STATE as walletsInitialState } from "./wallet/wallets";

// A custom configuration to store the authentication into the Keychain
export const authenticationPersistConfig: PersistConfig = {
  key: "authentication",
  storage: createSecureStorage(),
  blacklist: ["deepLink"]
};

// A custom configuration to store the fail information of the identification section
export const identificationPersistConfig: PersistConfig = {
  key: "identification",
  storage: AsyncStorage,
  blacklist: ["progress"],
  transforms: [DateISO8601Transform]
};

/**
 * Here we combine all the reducers.
 * We use the best practice of separating UI state from the DATA state.
 * UI state is mostly used to check what to show hide in the screens (ex.
 * errors/spinners).
 * DATA state is where we store real data fetched from the API (ex.
 * profile/messages).
 * More at
 * @https://medium.com/statuscode/dissecting-twitters-redux-store-d7280b62c6b1
 */
export const appReducer: Reducer<GlobalState, Action> = combineReducers<
  GlobalState,
  Action
>({
  //
  // ephemeral state
  //
  appState: appStateReducer,
  navigation: navigationReducer,
  backoffError: backoffErrorReducer,
  wallet: walletReducer,
  versionInfo: versionInfoReducer,
  backendStatus: backendStatusReducer,
  preferences: preferencesReducer,
  search: searchReducer,
  cie: cieReducer,
  bonus: bonusReducer,
  assistanceTools: assistanceToolsReducer,
  startup: startupReducer,
  //
  // persisted state
  //

  // custom persistor (uses secure storage)
  authentication: persistReducer<AuthenticationState, Action>(
    authenticationPersistConfig,
    authenticationReducer
  ),

  // standard persistor, see configureStoreAndPersistor.ts

  identification: persistReducer<IdentificationState, Action>(
    identificationPersistConfig,
    identificationReducer
  ),
  features: featuresPersistor,
  onboarding: onboardingReducer,
  notifications: notificationsReducer,
  profile: profileReducer,
  userDataProcessing: userDataProcessingReducer,
  userMetadata: userMetadataReducer,
  entities: persistReducer<EntitiesState, Action>(
    entitiesPersistConfig,
    entitiesReducer
  ),
  debug: debugReducer,
  persistedPreferences: persistedPreferencesReducer,
  installation: installationReducer,
  payments: paymentsReducer,
  content: contentReducer,
  emailValidation: emailValidationReducer,
  crossSessions: crossSessionsReducer,
  lollipop: lollipopPersistor
});

export function createRootReducer(
  persistConfigs: ReadonlyArray<PersistConfig>
) {
  return (state: GlobalState | undefined, action: Action): GlobalState => {
    if (isActionOf(sessionExpired, action)) {
      persistConfigs.forEach(
        pc => pc.key === "wallets" && purgeStoredState(pc)
      );
    }
    // despite logout fails the user must be logged out
    if (
      isActionOf(logoutFailure, action) ||
      isActionOf(logoutSuccess, action)
    ) {
      // Purge the stored redux-persist state
      persistConfigs.forEach(persistConfig => purgeStoredState(persistConfig));

      /**
       * We can't return undefined for nested persist reducer, we need to return
       * the basic redux persist content.
       */
      // for retro-compatibility
      // eslint-disable-next-line no-param-reassign
      state = state
        ? ({
            authentication: {
              ...autenticationInitialState,
              // eslint-disable-next-line no-underscore-dangle
              _persist: state.authentication._persist
            },
            // backend status must be kept
            backendStatus: state.backendStatus,
            // keep servicesMetadata from content section
            content: {
              ...contentInitialContentState
            },
            // keep hashed fiscal code
            crossSessions: state.crossSessions,
            // data should be kept across multiple sessions
            entities: {
              services: state.entities.services,
              organizations: state.entities.organizations,
              messagesStatus: state.entities.messagesStatus,
              paymentByRptId: state.entities.paymentByRptId,
              calendarEvents: state.entities.calendarEvents,
              // eslint-disable-next-line no-underscore-dangle
              _persist: state.entities._persist
            },
            features: {
              // eslint-disable-next-line no-underscore-dangle
              _persist: state.features._persist
            },
            identification: {
              ...identificationInitialState,
              // eslint-disable-next-line no-underscore-dangle
              _persist: state.identification._persist
            },
            // notifications must be kept
            notifications: {
              ...state.notifications
            },
            // payments must be kept
            payments: {
              ...state.payments
            },
            // isMixpanelEnabled must be kept
            persistedPreferences: {
              ...initialPreferencesState,
              isMixpanelEnabled: state.persistedPreferences.isMixpanelEnabled
            },
            wallet: {
              wallets: {
                ...walletsInitialState,
                // eslint-disable-next-line no-underscore-dangle
                _persist: state.wallet.wallets._persist
              }
            },
            lollipop: {
              ...initialLollipopState,
              keyTag: state.lollipop.keyTag,
              // eslint-disable-next-line no-underscore-dangle
              _persist: state.lollipop._persist
            }
          } as GlobalState)
        : state;
    }

    return appReducer(state, action);
  };
}

/* eslint-disable no-underscore-dangle */
/**
 * Aggregates all defined reducers
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, Reducer } from "redux";
import {
  createMigrate,
  MigrationManifest,
  PersistConfig,
  PersistedState,
  PersistPartial,
  persistReducer,
  purgeStoredState
} from "redux-persist";
import { isActionOf } from "typesafe-actions";
import { versionInfoReducer } from "../../common/versionInfo/store/reducers/versionInfo";
import { appearanceSettingsReducerInitialState } from "../../features/appearanceSettings/store/reducers";
import { appFeedbackInitialState } from "../../features/appReviews/store/reducers";
import {
  logoutFailure,
  logoutSuccess,
  sessionExpired
} from "../../features/authentication/common/store/actions";
import authenticationReducer, {
  INITIAL_STATE as authenticationInitialState,
  AuthenticationState
} from "../../features/authentication/common/store/reducers";
import { fastLoginOptInInitialState } from "../../features/authentication/fastLogin/store/reducers/optInReducer";
import { cieReducer } from "../../features/authentication/login/cie/store/reducers";
import { cieLoginInitialState } from "../../features/authentication/login/cie/store/reducers/cieLogin";
import bonusReducer from "../../features/bonus/common/store/reducers";
import { featuresPersistor } from "../../features/common/store/reducers";
import {
  fillShowLockModal,
  INITIAL_STATE as identificationInitialState,
  identificationReducer,
  IdentificationState
} from "../../features/identification/store/reducers";
import { lollipopPersistor } from "../../features/lollipop/store";
import { initialLollipopState } from "../../features/lollipop/store/reducers/lollipop";
import emailValidationReducer from "../../features/mailCheck/store/reducers/emailValidation";
import onboardingReducer from "../../features/onboarding/store/reducers";
import { profileSettingsReducerInitialState } from "../../features/profileSettings/store/reducers";
import { persistedNotificationsReducer } from "../../features/pushNotifications/store/reducers";
import profileReducer from "../../features/settings/common/store/reducers";
import userDataProcessingReducer from "../../features/settings/common/store/reducers/userDataProcessing";
import { trialSystemActivationStatusReducer } from "../../features/trialSystem/store/reducers";
import { whatsNewInitialState } from "../../features/whatsnew/store/reducers";
import { isDevEnv } from "../../utils/environment";
import { Action } from "../actions/types";
import createSecureStorage from "../storages/keychain";
import { DateISO8601Transform } from "../transforms/dateISO8601Tranform";
import { toyProfileReducer } from "../../features/toyProfile/store/reducers";
import appStateReducer from "./appState";
import assistanceToolsReducer from "./assistanceTools";
import { backendInfoReducer } from "./backendStatus/backendInfo";
import remoteConfigReducer from "./backendStatus/remoteConfig";
import sectionStatusReducer from "./backendStatus/sectionStatus";
import statusMessagesReducer from "./backendStatus/statusMessages";
import contentReducer, {
  initialContentState as contentInitialContentState
} from "./content";
import crossSessionsReducer from "./crossSessions";
import { debugPersistor } from "./debug";
import entitiesReducer, {
  entitiesPersistConfig,
  EntitiesState
} from "./entities";
import installationReducer from "./installation";
import { navigationReducer } from "./navigation";
import persistedPreferencesReducer, {
  initialPreferencesState
} from "./persistedPreferences";
import preferencesReducer from "./preferences";
import searchReducer from "./search";
import startupReducer from "./startup";
import { GlobalState } from "./types";

// A custom configuration to store the authentication into the Keychain
export const authenticationPersistConfig: PersistConfig = {
  key: "authentication",
  storage: createSecureStorage(),
  blacklist: ["deepLink"]
};

export const IDENTIFICATION_STATE_MIGRATION_VERSION = 0;
export const identificationStateMigration: MigrationManifest = {
  // version 0
  // we added showLockModal
  "0": (state: PersistedState) => {
    const previousState = state as IdentificationState & PersistPartial;
    const failData = previousState.fail
      ? fillShowLockModal(previousState.fail)
      : undefined;
    return {
      ...previousState,
      fail: failData
    } as PersistedState;
  }
};
// A custom configuration to store the fail information of the identification section
export const identificationPersistConfig: PersistConfig = {
  key: "identification",
  storage: AsyncStorage,
  blacklist: ["progress"],
  transforms: [DateISO8601Transform],
  version: IDENTIFICATION_STATE_MIGRATION_VERSION,
  migrate: createMigrate(identificationStateMigration, { debug: isDevEnv })
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
  toyProfile: toyProfileReducer,
  appState: appStateReducer,
  navigation: navigationReducer,
  versionInfo: versionInfoReducer,
  remoteConfig: remoteConfigReducer,
  statusMessages: statusMessagesReducer,
  sectionStatus: sectionStatusReducer,
  backendInfo: backendInfoReducer,
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
  notifications: persistedNotificationsReducer,
  profile: profileReducer,
  userDataProcessing: userDataProcessingReducer,
  entities: persistReducer<EntitiesState, Action>(
    entitiesPersistConfig,
    entitiesReducer
  ),
  debug: debugPersistor,
  persistedPreferences: persistedPreferencesReducer,
  installation: installationReducer,
  content: contentReducer,
  emailValidation: emailValidationReducer,
  crossSessions: crossSessionsReducer,
  lollipop: lollipopPersistor,
  trialSystem: trialSystemActivationStatusReducer
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
            toyProfile: state.toyProfile,
            authentication: {
              ...authenticationInitialState,

              _persist: state.authentication._persist
            },
            // cie status must be kept
            cie: {
              ...state.cie
            },
            // backend status must be kept
            backendInfo: state.backendInfo,
            remoteConfig: state.remoteConfig,
            statusMessages: state.statusMessages,
            sectionStatus: state.sectionStatus,
            // keep servicesMetadata from content section
            content: {
              ...contentInitialContentState,
              contextualHelp: state.content.contextualHelp
            },
            // keep hashed fiscal code
            crossSessions: state.crossSessions,
            // data should be kept across multiple sessions
            entities: {
              organizations: state.entities.organizations,
              paymentByRptId: state.entities.paymentByRptId,
              calendarEvents: state.entities.calendarEvents,
              _persist: state.entities._persist
            },
            features: {
              // connectivityStatus must be kept
              connectivityStatus: {
                ...state.features.connectivityStatus
              },
              appFeedback: {
                ...appFeedbackInitialState,
                _persist: state.features.appFeedback._persist
              },
              whatsNew: {
                ...whatsNewInitialState,
                _persist: state.features.whatsNew._persist
              },
              loginFeatures: {
                fastLogin: {
                  optIn: {
                    ...fastLoginOptInInitialState,
                    _persist:
                      state.features.loginFeatures.fastLogin.optIn._persist
                  },
                  securityAdviceAcknowledged: {
                    acknowledged:
                      state.features.loginFeatures.fastLogin
                        .securityAdviceAcknowledged.acknowledged,
                    _persist:
                      state.features.loginFeatures.fastLogin
                        .securityAdviceAcknowledged._persist
                  }
                },
                cieLogin: {
                  ...cieLoginInitialState,
                  isCieIDTourGuideEnabled:
                    state.features.loginFeatures.cieLogin
                      .isCieIDTourGuideEnabled,
                  _persist: state.features.loginFeatures.cieLogin._persist
                },
                loginPreferences: {
                  ...state.features.loginFeatures.loginPreferences
                }
              },
              profileSettings: {
                ...profileSettingsReducerInitialState,
                _persist: state.features.profileSettings._persist
              },
              appearanceSettings: {
                ...appearanceSettingsReducerInitialState,
                showAppearanceBanner:
                  state.features.appearanceSettings.showAppearanceBanner,
                _persist: state.features.appearanceSettings._persist
              },
              /**
               * IT Wallet state persists across sessions and is explicitly reset on session changes
               * via the itwLifecycleStoresReset action to ensure proper cleanup.
               * We can avoid to replicate the _persist property because itWallet already is a persisted
               * reducer.
               */
              itWallet: {
                ...state.features.itWallet
              },
              pn: {
                // Logout changes are already handled in PN's reducer.
                // This way, we make sure that if the user leaves the application
                // before the persistance is updated, we do not find ourselves
                // with a dirty state.
                ...state.features.pn
              },
              _persist: state.features._persist
            },
            identification: {
              ...identificationInitialState,
              _persist: state.identification._persist
            },
            // notifications must be kept
            notifications: {
              ...state.notifications,
              installation: {
                ...state.notifications.installation,
                // Make sure to register the token again upon login, since
                // such process deletes the token from the notification hub
                registeredToken: undefined,
                tokenStatus: { status: "unsent" }
              },
              _persist: state.notifications._persist
            },
            // isMixpanelEnabled must be kept
            // isFingerprintEnabled must be kept only if true
            persistedPreferences: {
              ...initialPreferencesState,
              isMixpanelEnabled: state.persistedPreferences.isMixpanelEnabled,
              isFingerprintEnabled: state.persistedPreferences
                .isFingerprintEnabled
                ? true
                : undefined
            },
            lollipop: {
              ...initialLollipopState,
              keyTag: state.lollipop.keyTag,
              _persist: state.lollipop._persist
            }
          } as GlobalState)
        : state;
    }

    return appReducer(state, action);
  };
}

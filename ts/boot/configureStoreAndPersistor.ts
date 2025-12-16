import * as pot from "@pagopa/ts-commons/lib/pot";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as O from "fp-ts/lib/Option";
import _, { merge, omit } from "lodash";
import {
  applyMiddleware,
  compose,
  createStore,
  Middleware,
  Reducer,
  StoreEnhancer
} from "redux";
import {
  createMigrate,
  MigrationManifest,
  PersistConfig,
  PersistedState,
  Persistor,
  persistReducer,
  persistStore
} from "redux-persist";
import { createLogger } from "redux-logger";
import createSagaMiddleware from "redux-saga";
import {
  isReady,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../common/model/RemoteValue";
import { CURRENT_REDUX_LOLLIPOP_STORE_VERSION } from "../features/lollipop/store";
import {
  initialLollipopState,
  LollipopState
} from "../features/lollipop/store/reducers/lollipop";
import rootSaga from "../sagas";
import { Action, Store } from "../store/actions/types";
import { analytics } from "../store/middlewares";
import {
  authenticationPersistConfig,
  createRootReducer
} from "../store/reducers";
import { ContentState } from "../store/reducers/content";
import { entitiesPersistConfig } from "../store/reducers/entities";
import {
  INSTALLATION_INITIAL_STATE,
  InstallationState
} from "../store/reducers/installation";
import {
  NOTIFICATIONS_STORE_VERSION,
  NotificationsState
} from "../features/pushNotifications/store/reducers";
import { generateInitialState } from "../features/pushNotifications/store/reducers/installation";
import { GlobalState, PersistedGlobalState } from "../store/reducers/types";
import { DateISO8601Transform } from "../store/transforms/dateISO8601Tranform";
import { PotTransform } from "../store/transforms/potTransform";
import { isDevEnv, isTestEnv } from "../utils/environment";
import { PersistedPreferencesState } from "../store/reducers/persistedPreferences";
import { SpidIdps } from "../../definitions/content/SpidIdps";
import { fromGeneratedToLocalSpidIdp } from "../utils/idps";
import { configureReactotron } from "./configureRectotron";

/**
 * Redux persist will migrate the store to the current version
 */
const CURRENT_REDUX_STORE_VERSION = 49;

// see redux-persist documentation:
// https://github.com/rt2zz/redux-persist/blob/master/docs/migrations.md
const migrations: MigrationManifest = {
  // version 0
  // we changed the way we compute the installation ID
  "0": (state: PersistedState): PersistedState =>
    ({
      ...state,
      notifications: {
        ...((state as any).notifications ? (state as any).notifications : {}),
        installation: generateInitialState()
      }
    } as PersistedState),

  // version 1
  // we changed the type of the services state to use Pot types so we clear all
  // the entitie to force a reload of messages and services
  "1": (state: PersistedState): PersistedState =>
    ({
      ...state,
      entities: {}
    } as PersistedState),

  // Version 2
  // Adds messagesIdsByServiceId
  "2": (state: PersistedState) =>
    merge({}, state, {
      entities: {
        messages: {
          idsByServiceId: {} // this has been removed after moving to paginated messages
        }
      }
    }),

  // Version 3
  // we changed the entities of organizations
  "3": (state: PersistedState) => {
    const entitiesState = (state as any).entities;
    const orgNameByFiscalCode = entitiesState.organizations;
    const allOrganizations = Object.keys(orgNameByFiscalCode).map(key => ({
      fiscalCode: key,
      name: orgNameByFiscalCode[key]
    }));

    return {
      ...state,
      entities: {
        ...(entitiesState ? entitiesState : {}),
        organizations: {
          nameByFiscalCode: orgNameByFiscalCode ? orgNameByFiscalCode : {},
          all: allOrganizations ? allOrganizations : {}
        }
      }
    };
  },

  // Version 4
  // we added a state to monitor what pagoPA environment is selected
  "4": (state: PersistedState) =>
    (state as PersistedGlobalState).persistedPreferences.isPagoPATestEnabled ===
    undefined
      ? {
          ...state,
          persistedPreferences: {
            ...(state as PersistedGlobalState).persistedPreferences,
            isPagoPATestEnabled: false
          }
        }
      : {
          ...state
        },

  // Version 5
  // we changed the way ToS acceptance is managed
  "5": (state: PersistedState) => ({
    ...state,
    onboarding: {
      isFingerprintAcknowledged: (state as PersistedGlobalState).onboarding
        .isFingerprintAcknowledged
    }
  }),

  // Version 6
  // we removed selectedFiscalCodes from organizations
  "6": (state: PersistedState) => {
    const entitiesState = (state as PersistedGlobalState).entities;
    const organizations = entitiesState.organizations;
    return {
      ...state,
      entities: {
        ...(entitiesState ? entitiesState : {}),
        organizations: {
          nameByFiscalCode: organizations.nameByFiscalCode
            ? organizations.nameByFiscalCode
            : {},
          all: organizations.all ? organizations.all : {}
        }
      }
    };
  },

  // Version 7
  // we empty the services list to get both services list and services metadata being reloaded and persisted
  "7": (state: PersistedState) => _.set(state, "entities.services.byId", {}),

  // Version 8
  // we load services scope in an specific view. So now it is uselss to hold (old) services metadata
  // they will be stored only when a service details screen is displayed
  "8": (state: PersistedState) => ({
    ...state,
    content: {
      ...(state as PersistedGlobalState).content,
      servicesMetadata: {}
    }
  }),

  // Version 9
  // we fix a bug on the version 8 of the migration implying a no proper creation of the content segment of store
  // (the servicesByScope state was not properly initialized)
  "9": (state: PersistedState) => ({
    ...state,
    content: {
      ...(state as PersistedGlobalState).content,
      servicesByScope: pot.none
    }
  }),
  // Version 10
  // since entities.messages are not persisted anymore, empty the related store section
  "10": (state: PersistedState) => ({
    ...state,
    entities: {
      ...(state as PersistedGlobalState).entities,
      messages: {}
    }
  }),

  // Version 11
  // add the default state for isCustomEmailChannelEnabled
  "11": (state: PersistedState) => ({
    ...state,
    persistedPreferences: {
      ...(state as PersistedGlobalState).persistedPreferences,
      isCustomEmailChannelEnabled: pot.none
    }
  }),
  // Version 12
  // change default state of isDebugModeEnabled: false
  "12": (state: PersistedState) => ({
    ...state,
    debug: {
      isDebugModeEnabled: false
    }
  }),
  // Version 13
  // add content.idpTextData
  // set default value
  "13": (state: PersistedState) => ({
    ...state,
    content: {
      ...(state as PersistedGlobalState).content,
      idpTextData: pot.none
    }
  }),
  // Version 14
  // remove content.idpTextData
  // add context.contextualHelp
  "14": (state: PersistedState) => {
    const content = (state as PersistedGlobalState).content;
    const newContent: ContentState = {
      municipality: content.municipality,
      contextualHelp: pot.none,
      idps: remoteUndefined
    };
    return {
      ...state,
      content: newContent
    };
  },
  // Version 15
  // added isMixpanelEnabled
  "15": (state: PersistedState) => {
    const persistedPreferences = (state as PersistedGlobalState)
      .persistedPreferences;
    return {
      ...state,
      persistedPreferences: { ...persistedPreferences, isMixpanelEnabled: null }
    };
  },
  // Version 16
  // default value for content.idps
  "16": (state: PersistedState) => {
    const content = (state as PersistedGlobalState).content;
    return {
      ...state,
      content: { ...content, idps: remoteUndefined }
    };
  },
  // Version 17
  // default value for new field 'registeredToken' in notifications.installation
  "17": (state: PersistedState) => {
    const notifications: NotificationsState = (state as PersistedGlobalState)
      .notifications;
    return {
      ...state,
      notifications: {
        ...notifications,
        installation: {
          ...notifications.installation,
          registeredToken: undefined
        }
      }
    };
  },
  // Version 18
  // since we removed servicesMetadata content section we need to migrate previous store versions
  "18": (state: PersistedState) => {
    const content: ContentState = (state as PersistedGlobalState).content;
    return {
      ...state,
      content: {
        ..._.omit(content, "servicesMetadata")
      }
    };
  },
  // Version 19
  // add features.MVL section with default preferences
  // Please note that MVL was completely removed since app version v2.33.x
  // (last migration version for v2.33.x is migration 22)
  "19": (state: PersistedState) => ({
    ...state,
    features: {
      mvl: {
        preferences: { showAlertForAttachments: true }
      }
    }
  }),
  // Version 20
  // add installation.appVersionHistory
  "20": (state: PersistedState) => {
    const installation: InstallationState = (state as PersistedGlobalState)
      .installation;
    return {
      ...state,
      installation: {
        ...installation,
        appVersionHistory: INSTALLATION_INITIAL_STATE.appVersionHistory
      }
    };
  },
  // Version 21
  // add lollipop
  "21": (state: PersistedState) => ({
    ...state,
    lollipop: initialLollipopState
  }),
  // Version 22
  // This migration is necessary because
  // in version 21 we switched from a keyTag of type string to a keyTag of type Option,
  // also moving the persistence from the root reducer to the lollipop reducer.
  // Therefore, there are users who are loading the old string state from the root reducer
  // and need to convert it to the new Option state,
  // since they don't have the lollipop persisted state yet.
  "22": (state: PersistedState) => {
    const lollipop: LollipopState = (state as PersistedGlobalState).lollipop;
    const keyTag = lollipop?.keyTag as unknown;
    if (typeof keyTag === "string") {
      return {
        ...state,
        lollipop: {
          ...initialLollipopState,
          keyTag: keyTag ? O.some(keyTag) : O.none,
          _persist: {
            version: CURRENT_REDUX_LOLLIPOP_STORE_VERSION,
            rehydrated: true
          }
        }
      };
    }
    return state;
  },
  // Version 23
  // Removes `isExperimentalFeaturesEnabled` property from persistedPreferences,
  // since is it not used anymore in the bottom bar logic
  "23": (state: PersistedState) => {
    const persistedPreferences = (state as PersistedGlobalState)
      .persistedPreferences;
    return {
      ...state,
      persistedPreferences: {
        ..._.omit(persistedPreferences, "isExperimentalFeaturesEnabled")
      }
    };
  },
  // Version 24
  // Adds payments history archive persistence
  "24": (state: PersistedState) =>
    merge(state, {
      features: {
        payments: {
          history: {
            archive: []
          }
        }
      }
    }),
  // Version 25
  // Adds new wallet section FF
  "25": (state: PersistedState) =>
    merge(state, {
      persistedPreferences: {
        isNewWalletSectionEnabled: false
      }
    }),
  // Version 26
  // Adds shouldShowPaymentsRedirectBanner persistence in feature wallet reducer
  "26": (state: PersistedState) =>
    merge(state, {
      features: {
        wallet: {
          preferences: {}
        }
      }
    }),
  // Version 27
  // Adds it wallet section FF
  "27": (state: PersistedState) =>
    merge(state, {
      persistedPreferences: {
        isItWalletTestEnabled: false
      }
    }),
  // Adds shouldShowAddMethodsBanner persistence in payments/home feature reducer
  "28": (state: PersistedState) =>
    merge(state, {
      features: {
        payments: {
          home: {
            shouldShowAddMethodsBanner: true
          }
        }
      }
    }),
  // Adds wallet cards placeholders persistence in wallet feature reducer
  "29": (state: PersistedState) =>
    merge(state, {
      features: {
        wallet: {
          placeholders: {}
        }
      }
    } as GlobalState),
  // Version 30
  // Adds new Messages Home FF
  "30": (state: PersistedState) =>
    merge(state, {
      persistedPreferences: {
        isNewHomeSectionEnabled: false
      }
    }),
  // version 31
  // remove userMetadata from persisted state
  "31": (state: PersistedState) => omit(state, "userMetadata"),
  // Version 32
  // Removes new Messages Home FF
  "32": (state: PersistedState) =>
    omit(state, "persistedPreferences.isNewHomeSectionEnabled"),
  // Version 33
  // Removes it wallet section FF
  "33": (state: PersistedState) =>
    omit(state, "persistedPreferences.isItWalletTestEnabled"),
  // removes show scan section and hide profile local FF
  "34": (state: PersistedState) =>
    omit(state, "persistedPreferences.isNewScanSectionEnabled"),
  // as a result of the PR revert, the data above was reinserted
  // PR: https://github.com/pagopa/io-app/pull/6145
  "35": (state: PersistedState) =>
    merge(state, {
      persistedPreferences: {
        isNewScanSectionEnabled: false
      }
    }),
  // Remove isNewScanSectionEnabled from persistedPreferences
  "36": (state: PersistedState) =>
    omit(state, "persistedPreferences.isNewScanSectionEnabled"),
  // Move 'notifications' from root persistor to its own
  "37": (state: PersistedState) => {
    const typedState = state as GlobalState;
    return {
      ...state,
      notifications: {
        ...typedState.notifications,
        installation: {
          ...typedState.notifications.installation,
          tokenStatus: { status: "unsent" }
        },
        _persist: {
          version: NOTIFICATIONS_STORE_VERSION,
          rehydrated: true
        }
      }
    };
  },
  // Remove old wallets&payments feature and persisted state
  "38": (state: PersistedState) => omit(state, "payments"),
  // Add 'isIOMarkdownEnabledOnMessagesAndServices' to 'persistedPreferences'
  "39": (state: PersistedState) => {
    const typedState = state as GlobalState;
    return {
      ...state,
      persistedPreferences: {
        ...typedState.persistedPreferences,
        isIOMarkdownEnabledOnMessagesAndServices: false
      }
    };
  },
  // Add 'isItwOfflineAccessEnabled' to 'persistedPreferences'
  "40": (state: PersistedState) => {
    const typedState = state as GlobalState;
    return {
      ...state,
      persistedPreferences: {
        ...typedState.persistedPreferences,
        isItwOfflineAccessEnabled: false
      }
    };
  },
  // Add 'fontPreference' to 'persistedPreferences'
  "41": (state: PersistedState) => {
    const typedState = state as GlobalState;
    return {
      ...state,
      persistedPreferences: {
        ...typedState.persistedPreferences,
        fontPreference: "comfortable"
      }
    };
  },
  // Remove 'isIOMarkdownEnabledOnMessagesAndServices' and rename 'isDesignSystemEnabled' to 'isExperimentalDesignEnabled'
  "42": (state: PersistedState) => {
    const typedState = state as GlobalState & {
      persistedPreferences: PersistedPreferencesState & {
        isDesignSystemEnabled: boolean;
        isIOMarkdownEnabledOnMessagesAndServices: boolean;
      };
    };
    const {
      isDesignSystemEnabled,
      isIOMarkdownEnabledOnMessagesAndServices,
      ...remaining
    } = typedState.persistedPreferences;
    return {
      ...state,
      persistedPreferences: {
        ...remaining,
        isExperimentalDesignEnabled: isDesignSystemEnabled
      }
    };
  },
  // Convert persisted IDPS from autogenerated spec to new local spec
  "43": (state: PersistedState) => {
    // Be aware that 'typedState' is not the entire content of 'state'.
    // We cast it to a partial type to represent the legacy part
    // that we want to convert but the instance of 'state' contains
    // all of the persisted data (which is later spread)
    const typedState = state as {
      content: {
        idps: RemoteValue<SpidIdps, Error>;
      };
    };

    return {
      // See comment above for 'state's content
      ...state,
      content: {
        // See comment above: 'typedState' contains more data that it is shown by the Typescript Intellisense
        ...typedState.content,
        idps: isReady(typedState.content.idps)
          ? remoteReady(
              fromGeneratedToLocalSpidIdp(typedState.content.idps.value.items)
            )
          : { ...typedState.content.idps }
      }
    };
  },
  // Remove isItwOfflineAccessEnabled from persistedPreferences
  "44": (state: PersistedState) =>
    omit(state, "persistedPreferences.isItwOfflineAccessEnabled"),
  // Add useMessagePaymentInfoV2 to persistedPreferences
  "45": (state: PersistedState) => {
    // Be aware that 'typedState' is not the entire content of 'state'.
    // We cast it to a partial type to represent the legacy part
    // that we want to convert but the instance of 'state' contains
    // all of the persisted data (which is later spread)
    const typedState = state as {
      persistedPreferences: object;
    };
    return {
      ...state,
      persistedPreferences: {
        ...typedState.persistedPreferences,
        useMessagePaymentInfoV2: false
      }
    };
  },
  // Remove useMessagePaymentInfoV2 to persistedPreferences
  "46": (state: PersistedState) => {
    // Be aware that 'typedState' is not the entire content of 'state'.
    // We cast it to a partial type to represent the legacy part
    // that we want to convert but the instance of 'state' contains
    // all of the persisted data (which is later spread)
    const typedState = state as {
      persistedPreferences: {
        useMessagePaymentInfoV2: boolean;
      };
    };
    const { useMessagePaymentInfoV2, ...restPersistedPreferences } =
      typedState.persistedPreferences;
    return {
      ...state,
      persistedPreferences: {
        ...restPersistedPreferences
      }
    };
  },
  // Add 'isAarFeatureEnabled' to 'persistedPreferences'
  "47": (state: PersistedState) => {
    const typedState = state as GlobalState;
    return {
      ...state,
      persistedPreferences: {
        ...typedState.persistedPreferences,
        isAarFeatureEnabled: false
      }
    };
  },
  // Add 'themePreference' to 'persistedPreferences'
  "48": (state: PersistedState) => {
    const typedState = state as GlobalState;
    return {
      ...state,
      persistedPreferences: {
        ...typedState.persistedPreferences,
        themePreference: "light"
      }
    };
  },
  // Remove 'isAarFeatureEnabled' from 'persistedPreferences'
  "49": (state: PersistedState) => {
    // Be aware that 'typedState' is not the entire content of 'state'.
    // We cast it to a partial type to represent the legacy part
    // that we want to convert but the instance of 'state' contains
    // all of the persisted data (which is later spread)
    const typedState = state as {
      persistedPreferences: {
        isAarFeatureEnabled: boolean;
      };
    };
    const { isAarFeatureEnabled, ...restPersistedPreferences } =
      typedState.persistedPreferences;
    return {
      ...state,
      persistedPreferences: {
        ...restPersistedPreferences
      }
    };
  }
};

const isDebuggingInChrome = isDevEnv && !!window.navigator.userAgent;

const rootPersistConfig: PersistConfig = {
  key: "root",
  storage: AsyncStorage,
  version: CURRENT_REDUX_STORE_VERSION,
  migrate: createMigrate(migrations, { debug: isDevEnv }),
  // Sections of the store that must be persisted and rehydrated with this storage.
  whitelist: [
    "onboarding",
    "profile",
    "persistedPreferences",
    "installation",
    "content",
    "crossSessions"
  ],
  // Transform functions used to manipulate state on store/rehydrate
  // TODO: add optionTransform https://www.pivotaltracker.com/story/show/170998374
  transforms: [DateISO8601Transform, PotTransform]
};

const persistedReducer: Reducer<PersistedGlobalState, Action> = persistReducer<
  GlobalState,
  Action
>(
  rootPersistConfig,
  createRootReducer([
    rootPersistConfig,
    authenticationPersistConfig,
    entitiesPersistConfig
  ])
);

const logger = createLogger({
  predicate: (): boolean => isDebuggingInChrome,
  collapsed: true,
  duration: true
});

// configure Reactotron if the app is running in dev mode
export const RTron = undefined;
const sagaMiddleware = createSagaMiddleware();

function configureStoreAndPersistor(): {
  store: Store;
  persistor: Persistor;
} {
  const composeEnhancers =
    // eslint-disable-next-line no-underscore-dangle
    (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  const baseMiddlewares: ReadonlyArray<Middleware> = [
    sagaMiddleware,
    logger,
    analytics.actionTracking // generic tracker for selected redux actions
  ];

  const middlewares = applyMiddleware(...baseMiddlewares);

  // add Reactotron enhancer if the app is running in dev mode
  const enhancer: StoreEnhancer =
    // RTron && RTron.createEnhancer
    //   ? composeEnhancers(middlewares, RTron.createEnhancer())
    composeEnhancers(middlewares);

  const store: Store = createStore<
    PersistedGlobalState,
    Action,
    Record<string, unknown>,
    Record<string, unknown>
  >(persistedReducer, enhancer);
  const persistor = persistStore(store);

  // Run the main saga
  sagaMiddleware.run(rootSaga);

  return { store, persistor };
}

export const { store, persistor } = configureStoreAndPersistor();
export const testable = isTestEnv
  ? { CURRENT_REDUX_STORE_VERSION, migrations }
  : undefined;

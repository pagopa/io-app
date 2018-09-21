import { AsyncStorage } from "react-native";
import { NavigationState } from "react-navigation";
import { createReactNavigationReduxMiddleware } from "react-navigation-redux-helpers";
import { applyMiddleware, compose, createStore, Reducer } from "redux";
import { createLogger } from "redux-logger";
import {
  createMigrate,
  MigrationManifest,
  PersistConfig,
  PersistedState,
  Persistor,
  persistReducer,
  persistStore
} from "redux-persist";
import createSagaMiddleware from "redux-saga";

import { isDevEnvironment } from "../config";
import { analytics } from "../middlewares";
import rootSaga from "../sagas";
import { Action, Store, StoreEnhancer } from "../store/actions/types";
import {
  authenticationPersistConfig,
  createRootReducer
} from "../store/reducers";
import { getInitialState as getInstallationInitialState } from "../store/reducers/notifications/installation";
import { GlobalState, PersistedGlobalState } from "../store/reducers/types";
import { NAVIGATION_MIDDLEWARE_LISTENERS_KEY } from "../utils/constants";

/**
 * Redux persist will migrate the store to the current version
 */
const CURRENT_REDUX_STORE_VERSION = 0;

// see redux-persist documentation:
// https://github.com/rt2zz/redux-persist/blob/master/docs/migrations.md
const migrations: MigrationManifest = {
  "0": (state: PersistedState): PersistedState =>
    ({
      ...state,
      notifications: {
        ...((state as any).notifications ? (state as any).notifications : {}),
        installation: getInstallationInitialState()
      }
    } as PersistedState)
};

const isDebuggingInChrome = __DEV__ && !!window.navigator.userAgent;

const rootPersistConfig: PersistConfig = {
  key: "root",
  storage: AsyncStorage,
  version: CURRENT_REDUX_STORE_VERSION,
  migrate: createMigrate(migrations, { debug: isDevEnvironment() }),
  /**
   * Sections of the store that must be persisted and rehydrated with this storage.
   */
  whitelist: ["onboarding", "notifications", "profile", "entities"]
};

const persistedReducer: Reducer<PersistedGlobalState, Action> = persistReducer<
  GlobalState,
  Action
>(
  rootPersistConfig,
  createRootReducer([rootPersistConfig, authenticationPersistConfig])
);

const logger = createLogger({
  predicate: (): boolean => isDebuggingInChrome,
  collapsed: true,
  duration: true
});

const sagaMiddleware = createSagaMiddleware();

/**
 * The new react-navigation if integrated with redux need a middleware
 * so that any events that mutate the navigation state properly trigger
 * the event listeners.
 * For details check
 * @https://github.com/react-navigation/react-navigation/issues/3438.
 */
const navigation = createReactNavigationReduxMiddleware(
  // This is just a key to identify the Set of the listeners.
  // The same key will be used by the createReduxBoundAddListener function
  NAVIGATION_MIDDLEWARE_LISTENERS_KEY,
  // This is a selector to get the navigation state from the global state
  (state: GlobalState): NavigationState => state.nav
);

function configureStoreAndPersistor(): { store: Store; persistor: Persistor } {
  /**
   * If available use redux-devtool version of the compose function that allow
   * the inspection of the store from the devtool.
   */
  const composeEnhancers =
    (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const enhancer: StoreEnhancer = composeEnhancers(
    applyMiddleware(
      sagaMiddleware,
      logger,
      navigation,
      analytics.actionTracking, // generic tracker for selected redux actions
      analytics.screenTracking // tracks screen navigation
    )
  );

  const store: Store = createStore<PersistedGlobalState, Action, {}, {}>(
    persistedReducer,
    enhancer
  );
  const persistor = persistStore(store);

  if (isDebuggingInChrome) {
    // tslint:disable-next-line:no-object-mutation
    (window as any).store = store;
  }

  // Run the main saga
  sagaMiddleware.run(rootSaga);

  return { store, persistor };
}

export default configureStoreAndPersistor;

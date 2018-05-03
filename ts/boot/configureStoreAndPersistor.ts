import { createReactNavigationReduxMiddleware } from "react-navigation-redux-helpers";
import { applyMiddleware, compose, createStore } from "redux";
import { createLogger } from "redux-logger";
import { Persistor, persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import createSagaMiddleware from "redux-saga";
import thunk from "redux-thunk";
import { analytics } from "../middlewares";

import { NavigationState } from "react-navigation";
import { Action, Store, StoreEnhancer } from "../actions/types";
import rootReducer from "../reducers";
import { GlobalState } from "../reducers/types";
import rootSaga from "../sagas";
import { NAVIGATION_MIDDLEWARE_LISTENERS_KEY } from "../utils/constants";

const isDebuggingInChrome = __DEV__ && !!window.navigator.userAgent;

const persistConfig = {
  key: "root",
  storage,
  /**
   * Sections of the store that must not be persisted and rehydrated.
   */
  blacklist: ["navigation", "loading", "error"]
};

const persistedReducer = persistReducer<GlobalState, Action>(
  persistConfig,
  rootReducer
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
 * For details check @https://github.com/react-navigation/react-navigation/issues/3438.
 */
const navigation = createReactNavigationReduxMiddleware(
  // This is just a key to identify the Set of the listeners.
  // The same key will be used by the createReduxBoundAddListener function
  NAVIGATION_MIDDLEWARE_LISTENERS_KEY,
  // This is a selector to get the navigation state from the global state
  (state: GlobalState): NavigationState => state.navigation
);

function configureStoreAndPersistor(): {
  store: Store;
  persistor: Persistor;
} {
  /**
   * If available use redux-devtool version of the compose function that allow
   * the inspection of the store from the devtool.
   */
  const composeEnhancers =
    (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const enhancer: StoreEnhancer = composeEnhancers(
    applyMiddleware(
      thunk,
      sagaMiddleware,
      logger,
      navigation,
      analytics.actionTracking,
      analytics.screenTracking
    )
  );

  const store: Store = createStore<GlobalState, Action, {}, {}>(
    persistedReducer,
    enhancer
  );
  const persistor = persistStore(store);

  if (isDebuggingInChrome) {
    (window as any).store = store;
  }

  // Run the main saga
  sagaMiddleware.run(rootSaga);

  return { store, persistor };
}

export default configureStoreAndPersistor;

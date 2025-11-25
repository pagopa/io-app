import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { paymentsSetAddMethodsBannerVisible } from "../actions";
import { Action } from "../../../../../store/actions/types";

export type PaymentsHomeState = {
  shouldShowAddMethodsBanner: boolean;
};

const INITIAL_STATE: PaymentsHomeState = {
  shouldShowAddMethodsBanner: true
};

const reducer = (
  state: PaymentsHomeState = INITIAL_STATE,
  action: Action
): PaymentsHomeState => {
  switch (action.type) {
    case getType(paymentsSetAddMethodsBannerVisible):
      return {
        ...state,
        shouldShowAddMethodsBanner: action.payload
      };
  }
  return state;
};

const CURRENT_REDUX_PAYMENTS_HOME_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "paymentsHome",
  storage: AsyncStorage,
  version: CURRENT_REDUX_PAYMENTS_HOME_STORE_VERSION,
  whitelist: ["shouldShowAddMethodsBanner"]
};

const persistedReducer = persistReducer<PaymentsHomeState, Action>(
  persistConfig,
  reducer
);

export default persistedReducer;

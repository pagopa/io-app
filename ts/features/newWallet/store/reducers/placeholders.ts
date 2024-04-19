import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import sha from "sha.js";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { WalletCardCategory } from "../../types";
import { walletAddCards, walletRemoveCards } from "../actions/cards";
import { walletToggleLoadingState } from "../actions/placeholders";

export type WalletPlaceholders = { [key: string]: WalletCardCategory };

export type WalletPlaceholdersState = {
  items: WalletPlaceholders;
  isLoading: boolean;
};

const INITIAL_STATE: WalletPlaceholdersState = {
  items: {},
  isLoading: false
};

const reducer = (
  state: WalletPlaceholdersState = INITIAL_STATE,
  action: Action
): WalletPlaceholdersState => {
  switch (action.type) {
    case getType(walletAddCards):
      return {
        ...state,
        items: action.payload.reduce(
          (acc, { category, key }) => ({
            ...acc,
            [hashKey(key)]: category
          }),
          state.items
        )
      };
    case getType(walletRemoveCards):
      return {
        ...state,
        items: Object.fromEntries(
          Object.entries(state.items).filter(
            ([key]) => !action.payload.map(hashKey).includes(key)
          )
        )
      };

    case getType(walletToggleLoadingState):
      return {
        ...state,
        isLoading: false
      };
  }
  return state;
};

// We have no control over what can be used as a key to store cards.
// Key hashing avoids storing sensitive data
const hashKey = (key: string) => sha("sha256").update(key).digest("hex");

const CURRENT_REDUX_WALLET_PLACEHOLDERS_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "walletPlaceholders",
  storage: AsyncStorage,
  version: CURRENT_REDUX_WALLET_PLACEHOLDERS_STORE_VERSION
};

export const walletReducerPersistor = persistReducer<
  WalletPlaceholdersState,
  Action
>(persistConfig, reducer);

export default walletReducerPersistor;

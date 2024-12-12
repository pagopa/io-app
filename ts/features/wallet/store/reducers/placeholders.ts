import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { WalletCard, WalletCardCategory } from "../../types";
import { walletAddCards, walletRemoveCards } from "../actions/cards";
import {
  walletResetPlaceholders,
  walletToggleLoadingState
} from "../actions/placeholders";

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
    case getType(walletToggleLoadingState):
      return {
        ...state,
        isLoading: action.payload
      };

    case getType(walletAddCards):
      return {
        ...state,
        items: action.payload.reduce(cardPlaceholderReducerFn, state.items)
      };

    case getType(walletRemoveCards):
      return {
        ...state,
        items: Object.fromEntries(
          Object.entries(state.items).filter(
            ([key]) => !action.payload.includes(key)
          )
        )
      };

    case getType(walletResetPlaceholders):
      return {
        ...state,
        items: action.payload.reduce(cardPlaceholderReducerFn, {})
      };
  }
  return state;
};

const cardPlaceholderReducerFn = (
  acc: WalletPlaceholders,
  { category, key, type, hidden }: WalletCard
) => {
  // Hidden cards and placeholder cards are not added to the placeholders
  if (hidden || type === "placeholder") {
    return acc;
  }

  return {
    ...acc,
    [key]: category
  };
};

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

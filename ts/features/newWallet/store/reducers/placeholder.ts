import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { WalletCardCategory } from "../../types";
import {
  walletAddCards,
  walletRemoveCards,
  walletUpsertCard
} from "../actions/cards";

export type WalletPlaceholdersState = {
  [key in WalletCardCategory]?: Set<string>;
};

const INITIAL_STATE: WalletPlaceholdersState = {};

const reducer = (
  state: WalletPlaceholdersState = INITIAL_STATE,
  action: Action
): WalletPlaceholdersState => {
  switch (action.type) {
    case getType(walletUpsertCard):
      return {
        ...state
      };
    case getType(walletAddCards):
      return {};
    case getType(walletRemoveCards):
      return {};
  }
  return state;
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

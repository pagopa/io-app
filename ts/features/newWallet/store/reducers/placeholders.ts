import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import sha from "sha.js";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { WalletCardCategory } from "../../types";
import { walletAddCards, walletRemoveCards } from "../actions/cards";

export type WalletPlaceholdersState = { [key: string]: WalletCardCategory };

const INITIAL_STATE: WalletPlaceholdersState = {};

const reducer = (
  state: WalletPlaceholdersState = INITIAL_STATE,
  action: Action
): WalletPlaceholdersState => {
  switch (action.type) {
    case getType(walletAddCards):
      return action.payload.reduce(
        (acc, { category, key }) => ({
          ...acc,
          [hashKey(key)]: category
        }),
        state
      );
    case getType(walletRemoveCards):
      return Object.fromEntries(
        Object.entries(state).filter(
          ([key]) => !action.payload.map(hashKey).includes(key)
        )
      );
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

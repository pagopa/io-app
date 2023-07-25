import { combineReducers } from "redux";
import { PersistConfig, PersistPartial, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Action } from "../../../../store/actions/types";
import itwCieReducer, { ItwCieState } from "./cie";
import itwWia, { ItwWIAState } from "./itwWia";
import itwCredentials, { ItwWalletState } from "./itwCredentials";

const CURRENT_REDUX_ITW_STORE_VERSION = 1;

export type ItWalletState = {
  wia: ItwWIAState;
  wallet: ItwWalletState;
  activation: ItwCieState;
};

export type PersistedItWalletState = ItWalletState & PersistPartial;

const persistConfig: PersistConfig = {
  key: "itWallet",
  storage: AsyncStorage,
  version: CURRENT_REDUX_ITW_STORE_VERSION,
  whitelist: ["wallet"]
};

const reducers = combineReducers<ItWalletState, Action>({
  wia: itwWia,
  wallet: itwCredentials,
  activation: itwCieReducer
});

const itwReducer = persistReducer<ItWalletState, Action>(
  persistConfig,
  reducers
);

export default itwReducer;

import { combineReducers } from "redux";
import { PersistConfig, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Action } from "../../../../store/actions/types";
import itwCieReducer, { ItwCieState } from "./cie";
import itwRequirements, { ItwRequirementsState } from "./itwRequirements";
import itwCredentials, { ItwCredentialsState } from "./itwCredentials";

const CURRENT_REDUX_ITW_STORE_VERSION = 1;

export type ItWalletState = {
  requirements: ItwRequirementsState;
  credentials: ItwCredentialsState;
  activation: ItwCieState;
};

const persistConfig: PersistConfig = {
  key: "itWallet",
  storage: AsyncStorage,
  version: CURRENT_REDUX_ITW_STORE_VERSION,
  whitelist: ["credentials"]
};

const reducers = combineReducers<ItWalletState, Action>({
  requirements: itwRequirements,
  credentials: itwCredentials,
  activation: itwCieReducer
});

const itwReducer = persistReducer<ItWalletState, Action>(
  persistConfig,
  reducers
);

export default itwReducer;

import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";
import { PersistConfig, PersistPartial, persistReducer } from "redux-persist";
import { Action } from "../../../../../store/actions/types";
import itwCredentialsReducer, {
  ItwCredentialsState
} from "../../../credentials/store/reducers";
import identificationReducer, {
  ItwIdentificationState
} from "../../../identification/store/reducers";
import issuanceReducer, {
  ItwIssuanceState
} from "../../../issuance/store/reducers";
import lifecycleReducer, {
  ItwLifecycleState
} from "../../../lifecycle/store/reducers";
import wiaReducer, {
  ItwWalletInstanceState
} from "../../../walletInstance/store/reducers";
import preferencesReducer, { ItwPreferencesState } from "./preferences";

export type ItWalletState = {
  identification: ItwIdentificationState;
  issuance: ItwIssuanceState;
  lifecycle: ItwLifecycleState;
  credentials: ItwCredentialsState & PersistPartial;
  walletInstance: ItwWalletInstanceState & PersistPartial;
  preferences: ItwPreferencesState;
};

export type PersistedItWalletState = ReturnType<typeof persistedReducer>;

const CURRENT_REDUX_ITW_STORE_VERSION = -1;

const itwReducer = combineReducers({
  identification: identificationReducer,
  issuance: issuanceReducer,
  lifecycle: lifecycleReducer,
  credentials: itwCredentialsReducer,
  walletInstance: wiaReducer,
  preferences: preferencesReducer
});

const itwPersistConfig: PersistConfig = {
  key: "itWallet",
  storage: AsyncStorage,
  whitelist: ["issuance", "lifecycle", "preferences"] satisfies Array<
    keyof ItWalletState
  >,
  version: CURRENT_REDUX_ITW_STORE_VERSION
};

export const persistedReducer = persistReducer<ItWalletState, Action>(
  itwPersistConfig,
  itwReducer
);

export default persistedReducer;

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
import wiaReducer, { ItwWiaState } from "../../../wia/store/reducers";

export type ItWalletState = {
  identification: ItwIdentificationState;
  issuance: ItwIssuanceState;
  lifecycle: ItwLifecycleState;
  credentials: ItwCredentialsState & PersistPartial;
  wia: ItwWiaState & PersistPartial;
};

export type PersistedItWalletState = ReturnType<typeof persistedReducer>;

const CURRENT_REDUX_ITW_STORE_VERSION = -1;

const itwReducer = combineReducers({
  identification: identificationReducer,
  issuance: issuanceReducer,
  lifecycle: lifecycleReducer,
  credentials: itwCredentialsReducer,
  wia: wiaReducer
});

const itwPersistConfig: PersistConfig = {
  key: "itWallet",
  storage: AsyncStorage,
  whitelist: ["issuance", "lifecycle"] satisfies Array<keyof ItWalletState>,
  version: CURRENT_REDUX_ITW_STORE_VERSION
};

export const persistedReducer = persistReducer<ItWalletState, Action>(
  itwPersistConfig,
  itwReducer
);

export default persistedReducer;

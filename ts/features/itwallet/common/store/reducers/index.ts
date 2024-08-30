import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, PersistPartial, persistReducer } from "redux-persist";
import { combineReducers } from "redux";
import { Action } from "../../../../../store/actions/types";
import identificationReducer, {
  ItwIdentificationState
} from "../../../identification/store/reducers";
import issuanceReducer, {
  ItwIssuanceState
} from "../../../issuance/store/reducers";
import lifecycleReducer, {
  ItwLifecycleState
} from "../../../lifecycle/store/reducers";
import itwCredentialsReducer, {
  ItwCredentialsState
} from "../../../credentials/store/reducers";
import itwCreateCredentialsStorage from "../storages/itwCredentialsStorage";

export type ItWalletState = {
  identification: ItwIdentificationState;
  issuance: ItwIssuanceState;
  lifecycle: ItwLifecycleState;
  credentials: ItwCredentialsState & PersistPartial;
};

export type PersistedItWalletState = ReturnType<typeof persistedReducer>;

const CURRENT_REDUX_ITW_STORE_VERSION = -1;
const CURRENT_REDUX_ITW_CREDENTIALS_STORE_VERSION = -1;

const itwPersistConfig: PersistConfig = {
  key: "itWallet",
  storage: AsyncStorage,
  whitelist: ["issuance", "lifecycle"] satisfies Array<keyof ItWalletState>,
  version: CURRENT_REDUX_ITW_STORE_VERSION
};

const itwCredentialsPersistConfig: PersistConfig = {
  key: "itWalletCredentials",
  storage: itwCreateCredentialsStorage(),
  version: CURRENT_REDUX_ITW_CREDENTIALS_STORE_VERSION
};

const itwReducer = combineReducers({
  identification: identificationReducer,
  issuance: issuanceReducer,
  lifecycle: lifecycleReducer,
  credentials: persistReducer(
    itwCredentialsPersistConfig,
    itwCredentialsReducer
  )
});

export const persistedReducer = persistReducer<ItWalletState, Action>(
  itwPersistConfig,
  itwReducer
);

export default persistedReducer;

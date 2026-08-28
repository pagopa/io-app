import AsyncStorage from "@react-native-async-storage/async-storage";
import { createMigrate, PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";

import { Action } from "../../../../../store/actions/types";
import { isDevEnv } from "../../../../../utils/environment";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";
import {
  itwRemoveIntegrityKeyTag,
  itwSetIntegrityServiceStatus,
  itwStoreIntegrityKeyTag
} from "../actions";
import {
  CURRENT_REDUX_ITW_ISSUANCE_STORE_VERSION,
  itwIssuanceStateMigrations
} from "./migrations";

export type IntegrityServiceStatus = "error" | "ready" | "unavailable";

export type ItwIssuanceState = {
  integrityKeyTag: string | undefined;
  integrityServiceStatus?: IntegrityServiceStatus;
};

export const itwIssuanceInitialState: ItwIssuanceState = {
  integrityKeyTag: undefined
};

const reducer = (
  state: ItwIssuanceState = itwIssuanceInitialState,
  action: Action
): ItwIssuanceState => {
  switch (action.type) {
    case getType(itwLifecycleStoresReset):
    case getType(itwRemoveIntegrityKeyTag):
      return {
        ...state,
        integrityKeyTag: undefined
      };
    case getType(itwSetIntegrityServiceStatus):
      return {
        ...state,
        integrityServiceStatus: action.payload
      };
    case getType(itwStoreIntegrityKeyTag):
      return {
        ...state,
        integrityKeyTag: action.payload
      };
  }
  return state;
};

const itwIssuancePersistConfig: PersistConfig = {
  key: "issuance",
  storage: AsyncStorage,
  whitelist: ["integrityKeyTag"] satisfies Array<keyof ItwIssuanceState>,
  version: CURRENT_REDUX_ITW_ISSUANCE_STORE_VERSION,
  migrate: createMigrate(itwIssuanceStateMigrations, { debug: isDevEnv })
};

const persistedReducer = persistReducer(itwIssuancePersistConfig, reducer);

export default persistedReducer;

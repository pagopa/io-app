import AsyncStorage from "@react-native-async-storage/async-storage";
import * as O from "fp-ts/lib/Option";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";
import {
  itwRemoveIntegrityKeyTag,
  itwSetIntegrityServiceStatus,
  itwStoreIntegrityKeyTag
} from "../actions";

const CURRENT_REDUX_ITW_ISSUANCE_STORE_VERSION = -1;

export type IntegrityServiceStatus = "ready" | "unavailable" | "error";

export type ItwIssuanceState = {
  integrityKeyTag: O.Option<string>;
  integrityServiceStatus?: IntegrityServiceStatus;
};

export const itwIssuanceInitialState: ItwIssuanceState = {
  integrityKeyTag: O.none
};

const reducer = (
  state: ItwIssuanceState = itwIssuanceInitialState,
  action: Action
): ItwIssuanceState => {
  switch (action.type) {
    case getType(itwSetIntegrityServiceStatus):
      return {
        ...state,
        integrityServiceStatus: action.payload
      };
    case getType(itwStoreIntegrityKeyTag):
      return {
        ...state,
        integrityKeyTag: O.some(action.payload)
      };
    case getType(itwLifecycleStoresReset):
    case getType(itwRemoveIntegrityKeyTag):
      return {
        ...state,
        integrityKeyTag: O.none
      };
  }
  return state;
};

const itwIssuancePersistConfig: PersistConfig = {
  key: "issuance",
  storage: AsyncStorage,
  whitelist: ["integrityKeyTag"] satisfies Array<keyof ItwIssuanceState>,
  version: CURRENT_REDUX_ITW_ISSUANCE_STORE_VERSION
};

const persistedReducer = persistReducer(itwIssuancePersistConfig, reducer);

export default persistedReducer;

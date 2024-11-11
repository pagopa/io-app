import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { PersistConfig, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Action } from "../../../../../store/actions/types";
import {
  itwIntegritySetServiceIsReady,
  itwRemoveIntegrityKeyTag,
  itwStoreIntegrityKeyTag
} from "../actions";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";

const CURRENT_REDUX_ITW_ISSUANCE_STORE_VERSION = -1;

export type ItwIssuanceState = {
  integrityKeyTag: O.Option<string>;
  integrityServiceReady?: boolean;
};

export const itwIssuanceInitialState: ItwIssuanceState = {
  integrityKeyTag: O.none
};

const reducer = (
  state: ItwIssuanceState = itwIssuanceInitialState,
  action: Action
): ItwIssuanceState => {
  switch (action.type) {
    case getType(itwStoreIntegrityKeyTag):
      return {
        ...state,
        integrityKeyTag: O.some(action.payload)
      };
    case getType(itwRemoveIntegrityKeyTag):
      return {
        ...state,
        integrityKeyTag: O.none
      };
    case getType(itwIntegritySetServiceIsReady):
      return {
        ...state,
        integrityServiceReady: action.payload
      };
    case getType(itwLifecycleStoresReset):
      return {
        integrityKeyTag: O.none,
        integrityServiceReady: undefined
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

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as O from "fp-ts/lib/Option";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { itwStoreIntegrityKeyTag } from "../actions";

export type ItwIssuanceState = {
  integrityKeyTag: O.Option<string>;
};

const INITIAL_STATE: ItwIssuanceState = {
  integrityKeyTag: O.none
};

const reducer = (
  state: ItwIssuanceState = INITIAL_STATE,
  action: Action
): ItwIssuanceState => {
  switch (action.type) {
    case getType(itwStoreIntegrityKeyTag):
      return {
        ...state,
        integrityKeyTag: O.some(action.payload)
      };
  }
  return state;
};

const CURRENT_REDUX_ITW_ISSUANCE_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "itwIssuance",
  storage: AsyncStorage,
  version: CURRENT_REDUX_ITW_ISSUANCE_STORE_VERSION,
  whitelist: ["integrityKeyTag"]
};

export const persistedReducer = persistReducer<ItwIssuanceState, Action>(
  persistConfig,
  reducer
);

export default persistedReducer;

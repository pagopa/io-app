import AsyncStorage from "@react-native-community/async-storage";
import { PersistConfig, PersistPartial, persistReducer } from "redux-persist";
import { Action } from "../../store/actions/types";
import { PotTransform } from "../../store/transforms/potTransform";
import { pnReducer, PnState } from "./store/reducers";

const CURRENT_REDUX_PN_STORE_VERSION = 1;

export type PersistedPnState = PnState & PersistPartial;

export const pnPersistConfig: PersistConfig = {
  key: "pn",
  storage: AsyncStorage,
  version: CURRENT_REDUX_PN_STORE_VERSION,
  whitelist: ["preferences"],
  transforms: [PotTransform]
};

export const pnPersistor = persistReducer<PnState, Action>(
  pnPersistConfig,
  pnReducer
);

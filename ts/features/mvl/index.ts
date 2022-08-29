import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, PersistPartial, persistReducer } from "redux-persist";
import { Action } from "../../store/actions/types";
import { PotTransform } from "../../store/transforms/potTransform";
import { mvlReducer as rootReducer, MvlState } from "./store/reducers";

const CURRENT_REDUX_MVL_STORE_VERSION = 1;

export type PersistedMvlState = MvlState & PersistPartial;

export const mvlPersistConfig: PersistConfig = {
  key: "mvl",
  storage: AsyncStorage,
  version: CURRENT_REDUX_MVL_STORE_VERSION,
  whitelist: ["preferences", "downloads"],
  transforms: [PotTransform]
};

export const mvlPersistor = persistReducer<MvlState, Action>(
  mvlPersistConfig,
  rootReducer
);

import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, PersistPartial, persistReducer } from "redux-persist";
import { Action } from "../../../store/actions/types";
import lollipopReducer, { LollipopState } from "./reducers/lollipop";

export type PersistedLollipopState = LollipopState & PersistPartial;

export const lollipopPersistConfig: PersistConfig = {
  key: "lollipop",
  storage: AsyncStorage,
  blacklist: ["publicKey"]
};

export const lollipopPersistor = persistReducer<LollipopState, Action>(
  lollipopPersistConfig,
  lollipopReducer
);

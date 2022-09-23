import AsyncStorage from "@react-native-community/async-storage";
import {
  createMigrate,
  MigrationManifest,
  PersistConfig,
  PersistedState,
  PersistPartial,
  persistReducer
} from "redux-persist";
import { Action } from "../../store/actions/types";
import { PotTransform } from "../../store/transforms/potTransform";
import { isDevEnv } from "../../utils/environment";
import { MvlState, mvlReducer as rootReducer } from "./store/reducers";

const CURRENT_REDUX_MVL_STORE_VERSION = 2;
const migrations: MigrationManifest = {
  // version 2
  // reset "downloads" section because of changing how they are stored
  "2": (state: PersistedState): PersistedMvlState => {
    const mvl = state as PersistedMvlState;
    return {
      ...mvl,
      downloads: {}
    };
  }
};
export type PersistedMvlState = MvlState & PersistPartial;

export const mvlPersistConfig: PersistConfig = {
  key: "mvl",
  storage: AsyncStorage,
  version: CURRENT_REDUX_MVL_STORE_VERSION,
  whitelist: ["preferences", "downloads"],
  migrate: createMigrate(migrations, { debug: isDevEnv }),
  transforms: [PotTransform]
};

export const mvlPersistor = persistReducer<MvlState, Action>(
  mvlPersistConfig,
  rootReducer
);

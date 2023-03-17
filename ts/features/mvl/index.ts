import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createMigrate,
  MigrationManifest,
  PersistConfig,
  PersistedState,
  PersistPartial,
  persistReducer
} from "redux-persist";
import _ from "lodash";
import { Action } from "../../store/actions/types";
import { PotTransform } from "../../store/transforms/potTransform";
import { isDevEnv } from "../../utils/environment";
import { mvlReducer as rootReducer, MvlState } from "./store/reducers";

const CURRENT_REDUX_MVL_STORE_VERSION = 4;

const migrations: MigrationManifest = {
  // version 2
  // reset "downloads" section because of changing how they are stored
  "2": (state: PersistedState): PersistedMvlState => {
    const mvl = state as PersistedMvlState;
    return {
      ...mvl,
      downloads: {}
    } as PersistedMvlState;
  },
  // version 3
  // as the "downloads" section has been relocated to entities, remove it
  "3": (state: PersistedState): PersistedMvlState => {
    const mvl = state as PersistedMvlState;
    return {
      ..._.omit(mvl, "downloads")
    };
  },
  // version 4
  "4": (state: PersistedState): PersistedMvlState => {
    const mvl = state as PersistedMvlState;
    return {
      ..._.omit(mvl, "preferences")
    };
  }
};
export type PersistedMvlState = MvlState & PersistPartial;

export const mvlPersistConfig: PersistConfig = {
  key: "mvl",
  storage: AsyncStorage,
  version: CURRENT_REDUX_MVL_STORE_VERSION,
  migrate: createMigrate(migrations, { debug: isDevEnv }),
  transforms: [PotTransform]
};

export const mvlPersistor = persistReducer<MvlState, Action>(
  mvlPersistConfig,
  rootReducer
);

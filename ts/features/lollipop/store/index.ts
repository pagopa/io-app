import * as O from "fp-ts/lib/Option";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createMigrate,
  MigrationManifest,
  PersistConfig,
  PersistedState,
  PersistPartial,
  persistReducer
} from "redux-persist";
import { Action } from "../../../store/actions/types";
import { isDevEnv } from "../../../utils/environment";
import lollipopReducer, { LollipopState } from "./reducers/lollipop";

const CURRENT_REDUX_LOLLIPOP_STORE_VERSION = 0;

const migrations: MigrationManifest = {
  // Version 0
  // LolliPoP PERSISTED redux type changes from
  // { keyTag?: string; _persist: ... }
  // to
  // { keyTag: O.Option<string>; _persist: ... }
  "0": (state: PersistedState): PersistedLollipopState => {
    type PreviousPersistedLolliPoPState = { keyTag?: string } & PersistPartial;
    const castedPeviousState =
      state as unknown as PreviousPersistedLolliPoPState;
    return {
      ...castedPeviousState,
      keyTag: O.fromNullable(castedPeviousState.keyTag),
      publicKey: O.none
    };
  }
};

export type PersistedLollipopState = LollipopState & PersistPartial;

export const lollipopPersistConfig: PersistConfig = {
  blacklist: ["publicKey"],
  key: "lollipop",
  migrate: createMigrate(migrations, { debug: isDevEnv }),
  storage: AsyncStorage,
  version: CURRENT_REDUX_LOLLIPOP_STORE_VERSION
};

export const lollipopPersistor = persistReducer<LollipopState, Action>(
  lollipopPersistConfig,
  lollipopReducer
);

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
import { pipe } from "fp-ts/lib/function";
import { Action } from "../../../store/actions/types";
import { isDevEnv } from "../../../utils/environment";
import lollipopReducer, { LollipopState } from "./reducers/lollipop";

export const CURRENT_REDUX_LOLLIPOP_STORE_VERSION = 1;

/**
 * This function is used to migrate the redux store from version 0 to version 1.
 * The migration is needed because the type of the persisted redux state has changed.
 * The keyTag field should be an Option<string>.
 * @param state the persisted redux state
 * @returns the migrated persisted redux state
 */
export const migrationKeyTagFunctional = (
  state: PersistedState
): PersistedLollipopState =>
  pipe(
    (state as PersistedLollipopState).keyTag as O.Option<O.Option<string>>,
    O.filter(keyTag => typeof keyTag !== "string"),
    O.fold(
      () => state as PersistedLollipopState,
      optionKeyTag =>
        pipe(
          optionKeyTag,
          O.fold(
            () =>
              ({
                ...state,
                keyTag: O.none
              } as PersistedLollipopState),
            keyTg =>
              ({
                ...state,
                keyTag: O.some(keyTg)
              } as PersistedLollipopState)
          )
        )
    )
  );

const migrations: MigrationManifest = {
  // Version 0
  // Lollipop PERSISTED redux type changes from
  // { keyTag?: string; _persist: ... }
  // to
  // { keyTag: O.Option<string>; _persist: ... }
  "0": (state: PersistedState): PersistedLollipopState => {
    type PreviousPersistedLollipopState = { keyTag?: string } & PersistPartial;
    const castedPeviousState =
      state as unknown as PreviousPersistedLollipopState;
    return {
      ...castedPeviousState,
      keyTag: O.fromNullable(castedPeviousState.keyTag),
      publicKey: O.none,
      supportedDevice: true
    };
  },
  "1": (state: PersistedState): PersistedLollipopState =>
    migrationKeyTagFunctional(state)
};

export type PersistedLollipopState = LollipopState & PersistPartial;

export const lollipopPersistConfig: PersistConfig = {
  blacklist: ["publicKey", "supportedDevice"],
  key: "lollipop",
  migrate: createMigrate(migrations, { debug: isDevEnv }),
  storage: AsyncStorage,
  version: CURRENT_REDUX_LOLLIPOP_STORE_VERSION
};

export const lollipopPersistor = persistReducer<LollipopState, Action>(
  lollipopPersistConfig,
  lollipopReducer
);

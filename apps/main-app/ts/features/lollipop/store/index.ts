import AsyncStorage from "@react-native-async-storage/async-storage";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import {
  createMigrate,
  MigrationManifest,
  PersistConfig,
  PersistedState,
  PersistPartial,
  persistReducer
} from "redux-persist";
import { v4 as uuid } from "uuid";

import { Action } from "../../../store/actions/types";
import { isDevEnv } from "../../../utils/environment";
import lollipopReducer, { LollipopState } from "./reducers/lollipop";

export const CURRENT_REDUX_LOLLIPOP_STORE_VERSION = 2;

/**
 * This function is used to migrate the redux store from version 0 to version 1.
 * The migration is needed because the type of the persisted redux state has changed.
 * The keyTag field should be an Option<string>.
 * @param state the persisted redux state
 * @returns the migrated persisted redux state
 */
export type PersistedLollipopStateV1 = Omit<
  PersistedLollipopState,
  "keyTag"
> & {
  keyTag: O.Option<string>;
};

export const migrationKeyTagFunctional = (
  state: PersistedState
): PersistedLollipopStateV1 =>
  pipe(
    (state as PersistedLollipopStateV1).keyTag as O.Option<O.Option<string>>,
    O.filter(keyTag => typeof keyTag !== "string"),
    O.fold(
      () => state as PersistedLollipopStateV1,
      optionKeyTag =>
        pipe(
          optionKeyTag,
          O.fold(
            () =>
              ({
                ...state,
                keyTag: O.none
              }) as PersistedLollipopStateV1,
            keyTg =>
              ({
                ...state,
                keyTag: O.some(keyTg)
              }) as PersistedLollipopStateV1
          )
        )
    )
  );

/**
 * This function is used to migrate the redux store from version 1 to version 2.
 * The migration is needed because the type of the persisted redux state has changed.
 * The keyTag field should go back to being a string | undefined.
 * @param state the persisted redux state
 * @returns the migrated persisted redux state
 */
export const migrationKeyTagToStringUndefined = (
  state: PersistedState
): PersistedLollipopState => {
  const castedPeviousState = state as unknown as PersistedLollipopStateV1;
  return {
    ...castedPeviousState,
    keyTag: O.toUndefined(castedPeviousState.keyTag)
  };
};

const migrations: MigrationManifest = {
  // Version 0
  // Lollipop PERSISTED redux type changes from
  // { keyTag?: string; _persist: ... }
  // to
  // { keyTag: O.Option<string>; _persist: ... }
  "0": (state: PersistedState): PersistedLollipopStateV1 => {
    type PreviousPersistedLollipopState = PersistPartial & { keyTag?: string };
    const castedPeviousState =
      state as unknown as PreviousPersistedLollipopState;
    return {
      ...castedPeviousState,
      keyTag: O.fromNullable(castedPeviousState.keyTag),
      publicKey: O.none,
      supportedDevice: true,
      ephemeralKey: {
        ephemeralKeyTag: uuid(),
        ephemeralPublicKey: undefined
      }
    };
  },
  "1": (state: PersistedState): PersistedLollipopStateV1 =>
    migrationKeyTagFunctional(state),
  // Version 2
  // Lollipop PERSISTED redux type changes from
  // { keyTag: O.Option<string>; _persist: ... }
  // back to
  // { keyTag: string | undefined; _persist: ... }
  "2": (state: PersistedState): PersistedLollipopState =>
    migrationKeyTagToStringUndefined(state)
};

export type PersistedLollipopState = LollipopState & PersistPartial;

export const lollipopPersistConfig: PersistConfig = {
  whitelist: ["keyTag"],
  key: "lollipop",
  migrate: createMigrate(migrations, { debug: isDevEnv }),
  storage: AsyncStorage,
  version: CURRENT_REDUX_LOLLIPOP_STORE_VERSION
};

export const lollipopPersistor = persistReducer<LollipopState, Action>(
  lollipopPersistConfig,
  lollipopReducer
);

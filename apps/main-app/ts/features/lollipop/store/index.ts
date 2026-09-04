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
import {
  fromNullable,
  isSome,
  none,
  SerializedOption,
  some,
  toUndefined
} from "../types/SerializedOption";
import lollipopReducer, {
  InMemoryLollipopData,
  LollipopState,
  PersistedLollipopData
} from "./reducers/lollipop";

export const CURRENT_REDUX_LOLLIPOP_STORE_VERSION = 2;

/**
 * This function is used to migrate the redux store from version 0 to version 1.
 * The migration is needed because the type of the persisted redux state has changed.
 * The keyTag field should be an Option<string>.
 * @param state the persisted redux state
 * @returns the migrated persisted redux state
 */

export type PersistedLollipopStateV0V1 = PersistPartial & {
  keyTag: SerializedOption<string>;
};

export const migrationKeyTagFunctional = (
  state: PersistedState
): PersistedLollipopStateV0V1 => {
  const castedPeviousState = state as PersistedLollipopStateV0V1;
  const keyTag = castedPeviousState.keyTag as unknown as SerializedOption<
    SerializedOption<string> | string
  >;

  if (!isSome(keyTag) || typeof keyTag.value === "string") {
    return castedPeviousState;
  }

  const innerKeyTag = keyTag.value;
  return {
    ...castedPeviousState,
    keyTag: isSome(innerKeyTag) ? some(innerKeyTag.value) : none
  };
};

/**
 * The keyTag field type was changed from O.Option<string> to string | undefined
 * @param state the persisted redux state
 * @returns the migrated persisted redux state
 */

export const migrationKeyTagToStringUndefined = (
  state: PersistedState
): PersistedLollipopState => {
  const castedPeviousState = state as PersistedLollipopStateV0V1;
  return {
    ...castedPeviousState,
    keyTag: toUndefined(castedPeviousState.keyTag)
  };
};

const migrations: MigrationManifest = {
  // Version 0
  // Lollipop PERSISTED redux type changes from
  // { keyTag?: string; _persist: ... }
  // to
  // { keyTag: O.Option<string>; _persist: ... }
  "0": (state: PersistedState): PersistedLollipopStateV0V1 => {
    type PreviousPersistedLollipopState = PersistPartial & { keyTag?: string };
    const castedPeviousState =
      state as unknown as PreviousPersistedLollipopState;
    return {
      ...castedPeviousState,
      keyTag: fromNullable(castedPeviousState.keyTag)
    };
  },
  "1": (state: PersistedState): PersistedLollipopStateV0V1 =>
    migrationKeyTagFunctional(state),
  // Version 2
  // Lollipop PERSISTED redux type changes from
  // { keyTag: O.Option<string>; _persist: ... }
  // to
  // { keyTag: string | undefined; _persist: ... }
  "2": (state: PersistedState): PersistedLollipopState =>
    migrationKeyTagToStringUndefined(state)
};
export type LollipopReducerState = InMemoryLollipopData &
  PersistedLollipopState;

type PersistedLollipopState = PersistedLollipopData & PersistPartial;

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

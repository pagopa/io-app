import { MigrationManifest, PersistedState } from "redux-persist";

type MigrationState = PersistedState & Record<string, any>;

export const CURRENT_REDUX_ITW_ISSUANCE_STORE_VERSION = 0;

/**
 * Shape of an `fp-ts` Option once it has been serialized by redux-persist.
 */
type SerializedOption = { _tag: "None" } | { _tag: "Some"; value: unknown };

const isSerializedOption = (value: unknown): value is SerializedOption =>
  typeof value === "object" &&
  value !== null &&
  "_tag" in value &&
  (value._tag === "Some" || value._tag === "None");

/**
 * Unwraps a persisted `fp-ts` Option into a plain optional value.
 *
 * Anything that is not a serialized Option is returned as is, so that a state persisted after
 * this migration (a plain string) survives a downgrade/upgrade cycle unchanged.
 */
const unwrapPersistedOption = (value: unknown): unknown => {
  if (!isSerializedOption(value)) {
    return value;
  }
  return value._tag === "Some" ? value.value : undefined;
};

export const itwIssuanceStateMigrations: MigrationManifest = {
  // Version 0
  // Replace the `fp-ts` Option wrapping the integrity key tag with a plain optional string
  "0": (state: MigrationState) => ({
    ...state,
    integrityKeyTag: unwrapPersistedOption(state.integrityKeyTag)
  })
};

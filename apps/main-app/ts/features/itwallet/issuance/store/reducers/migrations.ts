import { MigrationManifest, PersistedState } from "redux-persist";

type MigrationState = PersistedState & Record<string, any>;

export const CURRENT_REDUX_ITW_ISSUANCE_STORE_VERSION = 0;

/**
 * Discriminant of an `fp-ts` Option once it has been serialized by redux-persist.
 * The leading underscore comes from the `fp-ts` wire format, it is not our naming.
 */
const OPTION_TAG = "_tag";

type SerializedOption =
  | { [OPTION_TAG]: "None" }
  | { [OPTION_TAG]: "Some"; value: unknown };

const isSerializedOption = (value: unknown): value is SerializedOption => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const tag = (value as Record<string, unknown>)[OPTION_TAG];
  return tag === "Some" || tag === "None";
};

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
  return OPTION_TAG in value && value[OPTION_TAG] === "Some"
    ? value.value
    : undefined;
};

export const itwIssuanceStateMigrations: MigrationManifest = {
  // Version 0
  // Replace the `fp-ts` Option wrapping the integrity key tag with a plain optional string
  "0": (state: MigrationState) => ({
    ...state,
    integrityKeyTag: unwrapPersistedOption(state.integrityKeyTag)
  })
};

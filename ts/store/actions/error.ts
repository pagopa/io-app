import { ERROR_CLEAR, FetchRequestActionsType } from "./constants";

// Actions
type ErrorClear = Readonly<{
  type: typeof ERROR_CLEAR;
  payload: FetchRequestActionsType;
}>;

export type ErrorActions = ErrorClear;

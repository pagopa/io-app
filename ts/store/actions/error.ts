import { ERROR_CLEAR, FetchRequestActionsType } from "./constants";

// Actions
export type ErrorClear = {
  type: typeof ERROR_CLEAR;
  payload: FetchRequestActionsType;
};

export type ErrorActions = ErrorClear;

// Creators
export const clearError = (
  actionType: FetchRequestActionsType
): ErrorClear => ({
  type: ERROR_CLEAR,
  payload: actionType
});

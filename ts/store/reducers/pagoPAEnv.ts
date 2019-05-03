/**
 * A reducer for persisted preferences. Used to handle PagoPA environment.
 */
import { getType } from "typesafe-actions";
import { setPagoPAEnvironmentAsQa } from "../actions/pagoPAEnv";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type PagoPAEnvState = Readonly<{
  isPagoPAQAEnabled: boolean;
}>;

const INITIAL_STATE: PagoPAEnvState = {
  isPagoPAQAEnabled: false
};

export function pagoPAEnvReducer(
  state: PagoPAEnvState = INITIAL_STATE,
  action: Action
): PagoPAEnvState {
  switch (action.type) {
    case getType(setPagoPAEnvironmentAsQa):
      return {
        ...state,
        isPagoPAQAEnabled: action.payload
      };
  }
  return state;
}

// Selectors
export const isPagoPAQAEnabledSelector = (state: GlobalState): boolean =>
  state.pagoPAEnv.isPagoPAQAEnabled;

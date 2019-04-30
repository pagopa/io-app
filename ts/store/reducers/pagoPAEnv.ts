/**
 * A reducer for persisted preferences. Used to handle PagoPA environment.
 */
import { getType } from "typesafe-actions";
import { Action } from "../actions/types";
import { setPagoPAEnvironmentAsQa } from '../actions/pagoPAEnv';

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


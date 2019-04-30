/**
 * A reducer for persisted preferences. Used to handle PagoPA environment.
 */
import { isActionOf } from "typesafe-actions";
import { setPagoPAEnvironmentAsQa } from "../actions/pagoPAEnv";

import { Action } from "../actions/types";

export type PagoPAEnvState = Readonly<{
  isPagoPAQAEnabled?: boolean;
}>;

const initialPagoPAEnvState: PagoPAEnvState = {
  isPagoPAQAEnabled: false
};

export default function pagoPAEnvReducer(
  state: PagoPAEnvState = initialPagoPAEnvState,
  action: Action
): PagoPAEnvState {
  if (isActionOf(setPagoPAEnvironmentAsQa, action)) {
    return {
      ...state,
      isPagoPAQAEnabled: action.payload
    };
  }

  return state;
}

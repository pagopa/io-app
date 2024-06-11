import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";
import { paymentsGetPagoPaPlatformSessionTokenAction } from "../actions";
export const WALLET_PAYMENT_STEP_MAX = 4;

export type PaymentsPagoPaPlatformState = {
  sessionToken: pot.Pot<string, NetworkError>;
};

const INITIAL_STATE: PaymentsPagoPaPlatformState = {
  sessionToken: pot.none
};

const reducer = (
  state: PaymentsPagoPaPlatformState = INITIAL_STATE,
  action: Action
): PaymentsPagoPaPlatformState => {
  switch (action.type) {
    case getType(paymentsGetPagoPaPlatformSessionTokenAction.request):
      return {
        ...state,
        sessionToken: pot.toLoading(state.sessionToken)
      };
    case getType(paymentsGetPagoPaPlatformSessionTokenAction.success):
      return {
        ...state,
        sessionToken: pot.some(action.payload.token)
      };
    case getType(paymentsGetPagoPaPlatformSessionTokenAction.failure):
      return {
        ...state,
        sessionToken: pot.toError(state.sessionToken, action.payload)
      };
  }
  return state;
};

export default reducer;

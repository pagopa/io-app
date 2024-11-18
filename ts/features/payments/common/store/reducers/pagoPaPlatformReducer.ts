import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";
import {
  clearPaymentsPendingActions,
  paymentsGetPagoPaPlatformSessionTokenAction,
  paymentsResetPagoPaPlatformSessionTokenAction,
  savePaymentsPendingAction
} from "../actions";

export type PaymentsPagoPaPlatformState = {
  sessionToken: pot.Pot<string, NetworkError>;
  pendingActions: Array<Action>;
};

const INITIAL_STATE: PaymentsPagoPaPlatformState = {
  sessionToken: pot.none,
  pendingActions: []
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
        sessionToken: pot.some(action.payload.token as string)
      };
    case getType(paymentsGetPagoPaPlatformSessionTokenAction.failure):
      return {
        ...state,
        sessionToken: pot.toError(state.sessionToken, action.payload)
      };
    case getType(paymentsResetPagoPaPlatformSessionTokenAction):
      return {
        ...state,
        sessionToken: pot.none
      };
    // ADD PENDING ACTION WHILE REFRESHING THE PAGOPA TOKEN
    case getType(savePaymentsPendingAction):
      const actionToSave = action as ReturnType<
        typeof savePaymentsPendingAction
      >;
      return {
        ...state,
        pendingActions: [
          ...state.pendingActions,
          actionToSave.payload.pendingAction
        ]
      };
    case getType(clearPaymentsPendingActions):
      return {
        ...state,
        pendingActions: []
      };
  }
  return state;
};

export default reducer;

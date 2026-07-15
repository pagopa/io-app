import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { PaymentMethodsResponse } from "../../../../../../definitions/pagopa/walletv3/PaymentMethodsResponse";
import { WalletCreateResponse } from "../../../../../../definitions/pagopa/walletv3/WalletCreateResponse";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";
import {
  paymentsOnboardingGetMethodsAction,
  paymentsStartOnboardingAction
} from "../actions";

export type PaymentsOnboardingState = {
  paymentMethods: pot.Pot<PaymentMethodsResponse, NetworkError>;
  result: pot.Pot<WalletCreateResponse, NetworkError>;
  selectedPaymentMethodId?: string;
};

const INITIAL_STATE: PaymentsOnboardingState = {
  result: pot.none,
  paymentMethods: pot.noneLoading,
  selectedPaymentMethodId: undefined
};

const reducer = (
  state: PaymentsOnboardingState = INITIAL_STATE,
  action: Action
): PaymentsOnboardingState => {
  switch (action.type) {
    case getType(paymentsOnboardingGetMethodsAction.cancel):
      return {
        ...state,
        paymentMethods: pot.none
      };
    case getType(paymentsOnboardingGetMethodsAction.failure):
      return {
        ...state,
        paymentMethods: pot.toError(state.paymentMethods, action.payload)
      };
    // GET ONBOARDABLE PAYMENT METHODS LIST
    case getType(paymentsOnboardingGetMethodsAction.request):
      return {
        ...state,
        paymentMethods: pot.toLoading(pot.none)
      };
    case getType(paymentsOnboardingGetMethodsAction.success):
      return {
        ...state,
        paymentMethods: pot.some(action.payload)
      };
    case getType(paymentsStartOnboardingAction.cancel):
      return {
        ...state,
        selectedPaymentMethodId: undefined,
        result: pot.none
      };
    case getType(paymentsStartOnboardingAction.failure):
      return {
        ...state,
        result: pot.toError(state.result, action.payload)
      };
    // START ONBOARDING ACTIONS
    case getType(paymentsStartOnboardingAction.request):
      return {
        ...state,
        selectedPaymentMethodId: action.payload.paymentMethodId,
        result: pot.toLoading(pot.none)
      };
    case getType(paymentsStartOnboardingAction.success):
      return {
        ...state,
        result: pot.some(action.payload as WalletCreateResponse)
      };
  }
  return state;
};

export default reducer;

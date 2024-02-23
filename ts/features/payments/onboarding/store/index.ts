import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { PaymentMethodsResponse } from "../../../../../definitions/pagopa/walletv3/PaymentMethodsResponse";
import { WalletCreateResponse } from "../../../../../definitions/pagopa/walletv3/WalletCreateResponse";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { NetworkError } from "../../../../utils/errors";

import { walletGetPaymentMethods, walletStartOnboarding } from "./actions";

export type WalletOnboardingState = {
  result: pot.Pot<WalletCreateResponse, NetworkError>;
  paymentMethods: pot.Pot<PaymentMethodsResponse, NetworkError>;
};

const INITIAL_STATE: WalletOnboardingState = {
  result: pot.none,
  paymentMethods: pot.noneLoading
};

const walletOnboardingReducer = (
  state: WalletOnboardingState = INITIAL_STATE,
  action: Action
): WalletOnboardingState => {
  switch (action.type) {
    // START ONBOARDING ACTIONS
    case getType(walletStartOnboarding.request):
      return {
        ...state,
        result: pot.toLoading(pot.none)
      };
    case getType(walletStartOnboarding.success):
      return {
        ...state,
        result: pot.some(action.payload as WalletCreateResponse)
      };
    case getType(walletStartOnboarding.failure):
      return {
        ...state,
        result: pot.toError(state.result, action.payload)
      };
    case getType(walletStartOnboarding.cancel):
      return {
        ...state,
        result: pot.none
      };
    // GET ONBOARDABLE PAYMENT METHODS LIST
    case getType(walletGetPaymentMethods.request):
      return {
        ...state,
        paymentMethods: pot.toLoading(pot.none)
      };
    case getType(walletGetPaymentMethods.success):
      return {
        ...state,
        paymentMethods: pot.some(action.payload)
      };
    case getType(walletGetPaymentMethods.failure):
      return {
        ...state,
        paymentMethods: pot.toError(state.paymentMethods, action.payload)
      };
    case getType(walletGetPaymentMethods.cancel):
      return {
        ...state,
        paymentMethods: pot.none
      };
  }
  return state;
};

const walletOnboardingSelector = (state: GlobalState) =>
  state.features.payments.onboarding;

export const walletOnboardingStartupSelector = (state: GlobalState) =>
  walletOnboardingSelector(state).result;

export const walletOnboardingPaymentMethodsSelector = (state: GlobalState) =>
  walletOnboardingSelector(state).paymentMethods;

export const isLoadingPaymentMethodsSelector = (state: GlobalState) =>
  pot.isLoading(walletOnboardingSelector(state).paymentMethods);

export default walletOnboardingReducer;

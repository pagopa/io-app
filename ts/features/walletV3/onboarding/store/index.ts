import * as pot from "@pagopa/ts-commons/lib/pot";
import * as _ from "lodash";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { NetworkError } from "../../../../utils/errors";
import { GlobalState } from "../../../../store/reducers/types";
import { WalletCreateResponse } from "../../../../../definitions/pagopa/walletv3/WalletCreateResponse";
import { PaymentMethodsResponse } from "../../../../../definitions/pagopa/walletv3/PaymentMethodsResponse";

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
  state.features.wallet.onboarding;

export const walletOnboardingStartupSelector = createSelector(
  walletOnboardingSelector,
  onboarding => onboarding.result
);

export const walletOnboardingPaymentMethodsSelector = createSelector(
  walletOnboardingSelector,
  onboarding => onboarding.paymentMethods
);

export const isLoadingPaymentMethodsSelector = createSelector(
  walletOnboardingPaymentMethodsSelector,
  paymentMethods => pot.isLoading(paymentMethods)
);

export default walletOnboardingReducer;

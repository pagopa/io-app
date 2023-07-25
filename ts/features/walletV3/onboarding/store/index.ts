import * as pot from "@pagopa/ts-commons/lib/pot";
import * as _ from "lodash";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { NetworkError } from "../../../../utils/errors";
import { GlobalState } from "../../../../store/reducers/types";
import { WalletCreateResponse } from "../../../../../definitions/pagopa/walletv3/WalletCreateResponse";

import { walletStartOnboarding } from "./actions";

export type WalletOnboardingState = {
  result: pot.Pot<WalletCreateResponse, NetworkError>;
};

const INITIAL_STATE: WalletOnboardingState = {
  result: pot.none
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
        result: pot.some(action.payload)
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
  }
  return state;
};

const walletOnboardingSelector = (state: GlobalState) =>
  state.features.wallet.onboarding;

export const walletOnboardingStartupSelector = createSelector(
  walletOnboardingSelector,
  onboarding => onboarding.result
);

export default walletOnboardingReducer;

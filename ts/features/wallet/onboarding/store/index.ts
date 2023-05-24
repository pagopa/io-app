import { Action, combineReducers } from "redux";
import onboardingBancomatReducer, {
  OnboardingBancomatState
} from "../bancomat/store/reducers";
import onboardingBPayReducer, {
  OnboardingBPayState
} from "../bancomatPay/store/reducers";
import onboardingCoBadgeReducer, {
  OnboardingCoBadgeState
} from "../cobadge/store/reducers";
import onboardingSatispayReducer, {
  OnboardSatispayState
} from "../satispay/store/reducers";
import {
  onboardingPaypalReducer,
  OnboardPayPalState
} from "../paypal/store/reducers";

export type PaymentMethodOnboardingState = {
  // The information related to adding new Bancomat to the wallet
  bancomat: OnboardingBancomatState;
  satispay: OnboardSatispayState;
  bPay: OnboardingBPayState;
  coBadge: OnboardingCoBadgeState;
  paypal: OnboardPayPalState;
};

const onboardingReducer = combineReducers<PaymentMethodOnboardingState, Action>(
  {
    bancomat: onboardingBancomatReducer,
    satispay: onboardingSatispayReducer,
    bPay: onboardingBPayReducer,
    coBadge: onboardingCoBadgeReducer,
    paypal: onboardingPaypalReducer
  }
);

export default onboardingReducer;

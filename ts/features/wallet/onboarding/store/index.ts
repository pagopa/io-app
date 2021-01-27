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

export type PaymentMethodOnboardingState = {
  // The information related to adding new Bancomat to the wallet
  bancomat: OnboardingBancomatState;
  satispay: OnboardSatispayState;
  bPay: OnboardingBPayState;
  coBadge: OnboardingCoBadgeState;
};

const onboardingReducer = combineReducers<PaymentMethodOnboardingState, Action>(
  {
    bancomat: onboardingBancomatReducer,
    satispay: onboardingSatispayReducer,
    bPay: onboardingBPayReducer,
    coBadge: onboardingCoBadgeReducer
  }
);

export default onboardingReducer;

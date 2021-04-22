import { NavigationActions } from "react-navigation";
import WALLET_ONBOARDING_BPAY_ROUTES from "./routes";

export const navigateToOnboardingBPaySearchStartScreen = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_BPAY_ROUTES.START
  });

export const navigateToOnboardingBPayChooseBank = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_BPAY_ROUTES.CHOOSE_BANK
  });

export const navigateToOnboardingBPaySearchAvailableUserAccount = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_BPAY_ROUTES.SEARCH_AVAILABLE_USER_ACCOUNT
  });

export const navigateToOnboardingBPayAdd = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_BPAY_ROUTES.ADD_BPAY
  });

export const navigateToActivateBpdOnNewBPay = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_BPAY_ROUTES.ACTIVATE_BPD_NEW
  });

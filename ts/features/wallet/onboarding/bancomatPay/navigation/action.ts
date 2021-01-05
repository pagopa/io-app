import { NavigationActions } from "react-navigation";
import WALLET_ONBOARDING_BANCOMATPAY_ROUTES from "./routes";

export const navigateToOnboardingBancomatPaySearchStartScreen = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_BANCOMATPAY_ROUTES.START
  });

export const navigateToOnboardingBancomatPayChooseBank = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_BANCOMATPAY_ROUTES.CHOOSE_BANK
  });

export const navigateToOnboardingBancomatPaySearchAvailableUserBancomat = () =>
  NavigationActions.navigate({
    routeName:
      WALLET_ONBOARDING_BANCOMATPAY_ROUTES.SEARCH_AVAILABLE_USER_ACCOUNT
  });

export const navigateToOnboardingBancomatPayAdd = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_BANCOMATPAY_ROUTES.ADD_BANCOMATPAY
  });

export const navigateToActivateBpdOnNewBancomat = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_BANCOMATPAY_ROUTES.ACTIVATE_BPD_NEW
  });

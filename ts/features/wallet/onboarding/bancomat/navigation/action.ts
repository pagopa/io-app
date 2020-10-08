import { NavigationActions } from "react-navigation";
import WALLET_ONBOARDING_BANCOMAT_ROUTES from "./routes";

export const navigateToOnboardingBancomatChooseBank = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_BANCOMAT_ROUTES.CHOOSE_BANK
  });

export const navigateToOnboardingBancomatSearchAvailableUserBancomat = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_BANCOMAT_ROUTES.SEARCH_AVAILABLE_USER_BANCOMAT
  });

export const navigateToOnboardingBancomatAdd = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_BANCOMAT_ROUTES.ADD_BANCOMAT
  });

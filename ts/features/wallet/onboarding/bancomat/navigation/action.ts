import { NavigationActions } from "react-navigation";
import NavigationService from "../../../../../navigation/NavigationService";
import { InferNavigationParams } from "../../../../../types/react";
import { ActivateBpdOnNewCreditCardScreen } from "../../common/screens/bpd/ActivateBpdOnNewCreditCardScreen";
import WALLET_ONBOARDING_BANCOMAT_ROUTES from "./routes";

/**
 * @deprecated
 */
export const navigateToOnboardingBancomatSearchStartScreen = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: WALLET_ONBOARDING_BANCOMAT_ROUTES.BANCOMAT_START
    })
  );

/**
 * @deprecated
 */
export const navigateToOnboardingBancomatChooseBank = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: WALLET_ONBOARDING_BANCOMAT_ROUTES.CHOOSE_BANK
    })
  );

/**
 * @deprecated
 */
export const navigateToOnboardingBancomatSearchAvailableUserBancomat = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName:
        WALLET_ONBOARDING_BANCOMAT_ROUTES.SEARCH_AVAILABLE_USER_BANCOMAT
    })
  );

/**
 * @deprecated
 */
export const navigateToSuggestBpdActivation = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: WALLET_ONBOARDING_BANCOMAT_ROUTES.SUGGEST_BPD_ACTIVATION
    })
  );

/**
 * @deprecated
 */
export const navigateToActivateBpdOnNewBancomat = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: WALLET_ONBOARDING_BANCOMAT_ROUTES.ACTIVATE_BPD_NEW_BANCOMAT
    })
  );

/**
 * @deprecated
 */
export const navigateToActivateBpdOnNewCreditCard = (
  params: InferNavigationParams<typeof ActivateBpdOnNewCreditCardScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: WALLET_ONBOARDING_BANCOMAT_ROUTES.ACTIVATE_BPD_NEW_CREDIT_CARD,
      params
    })
  );

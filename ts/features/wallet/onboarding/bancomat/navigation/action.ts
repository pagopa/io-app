import { CommonActions } from "@react-navigation/native";
import NavigationService from "../../../../../navigation/NavigationService";
import ROUTES from "../../../../../navigation/routes";
import { ActivateBpdOnNewCreditCardScreenNavigationParams } from "../../common/screens/bpd/ActivateBpdOnNewCreditCardScreen";
import WALLET_ONBOARDING_BANCOMAT_ROUTES from "./routes";

/**
 * @deprecated
 */
export const navigateToOnboardingBancomatSearchStartScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: WALLET_ONBOARDING_BANCOMAT_ROUTES.MAIN,
      params: {
        screen: WALLET_ONBOARDING_BANCOMAT_ROUTES.BANCOMAT_START
      }
    })
  );

/**
 * @deprecated
 */
export const navigateToOnboardingBancomatChooseBank = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: WALLET_ONBOARDING_BANCOMAT_ROUTES.MAIN,
      params: {
        screen: WALLET_ONBOARDING_BANCOMAT_ROUTES.CHOOSE_BANK
      }
    })
  );

/**
 * @deprecated
 */
export const navigateToOnboardingBancomatSearchAvailableUserBancomat = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: WALLET_ONBOARDING_BANCOMAT_ROUTES.MAIN,
      params: {
        screen: WALLET_ONBOARDING_BANCOMAT_ROUTES.SEARCH_AVAILABLE_USER_BANCOMAT
      }
    })
  );

/**
 * @deprecated
 */
export const navigateToSuggestBpdActivation = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: WALLET_ONBOARDING_BANCOMAT_ROUTES.MAIN,
      params: {
        screen: WALLET_ONBOARDING_BANCOMAT_ROUTES.SUGGEST_BPD_ACTIVATION
      }
    })
  );

/**
 * @deprecated
 */
export const navigateToActivateBpdOnNewBancomat = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: WALLET_ONBOARDING_BANCOMAT_ROUTES.MAIN,
      params: {
        screen: WALLET_ONBOARDING_BANCOMAT_ROUTES.ACTIVATE_BPD_NEW_BANCOMAT
      }
    })
  );

/**
 * @deprecated
 */
export const navigateToActivateBpdOnNewCreditCard = (
  params: ActivateBpdOnNewCreditCardScreenNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: WALLET_ONBOARDING_BANCOMAT_ROUTES.MAIN,
      params: {
        screen: WALLET_ONBOARDING_BANCOMAT_ROUTES.ACTIVATE_BPD_NEW_CREDIT_CARD,
        params
      }
    })
  );

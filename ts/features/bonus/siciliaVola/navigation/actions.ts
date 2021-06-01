import { NavigationActions } from "react-navigation";
import WALLET_ONBOARDING_PRIVATIVE_ROUTES from "../../../wallet/onboarding/privative/navigation/routes";

export const navigateToOnboardingPrivativeChooseIssuerScreen = () =>
  NavigationActions.navigate({
    routeName: WALLET_ONBOARDING_PRIVATIVE_ROUTES.CHOOSE_ISSUER
  });

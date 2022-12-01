import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { IDPayOnboardingRoutes } from "../navigation/navigator";

const createActionsImplementation = (
  navigation: IOStackNavigationProp<AppParamsList, keyof AppParamsList>
) => {
  const navigateToPDNDCriteriaScreen = () => {
    navigation.navigate(IDPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IDPayOnboardingRoutes.IDPAY_ONBOARDING_PDNDACCEPTANCE
    });
  };

  const navigateToSelfDeclarationsScreen = () => {
    navigation.navigate(IDPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IDPayOnboardingRoutes.IDPAY_ONBOARDING_SELF_DECLARATIONS
    });
  };

  const navigateToCompletionScreen = () => {
    navigation.navigate(IDPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IDPayOnboardingRoutes.IDPAY_ONBOARDING_COMPLETION
    });
  };

  const exitOnboarding = () => {
    navigation.pop();
  };

  return {
    navigateToPDNDCriteriaScreen,
    navigateToSelfDeclarationsScreen,
    navigateToCompletionScreen,
    exitOnboarding
  };
};

export { createActionsImplementation };

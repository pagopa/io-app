import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { IDPayOnboardingRoutes } from "../navigation/navigator";
import { Context } from "./machine";

const createActionsImplementation = (
  navigation: IOStackNavigationProp<AppParamsList, keyof AppParamsList>
) => {
  const navigateToInitiativeDetailsScreen = (context: Context) => {
    if (context.serviceId === undefined) {
      throw new Error("serviceId is undefined");
    }

    navigation.navigate(IDPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IDPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS,
      params: {
        serviceId: context.serviceId
      }
    });
  };

  const navigateToPDNDCriteriaScreen = () => {
    navigation.navigate(IDPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IDPayOnboardingRoutes.IDPAY_ONBOARDING_PDNDACCEPTANCE
    });
  };

  const navigateToSelfDeclarationsScreen = () => {
    navigation.navigate(IDPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IDPayOnboardingRoutes.IDPAY_ONBOARDING_BOOL_SELF_DECLARATIONS
    });
  };

  const pushMultiPage = () => {
    navigation.push(IDPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IDPayOnboardingRoutes.IDPAY_ONBOARDING_BOOL_SELF_DECLARATIONS
    });
  };

  const navigateToCompletionScreen = () => {
    navigation.navigate(IDPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IDPayOnboardingRoutes.IDPAY_ONBOARDING_COMPLETION
    });
  };

  const navigateToFailureScreen = () => {
    navigation.navigate(IDPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IDPayOnboardingRoutes.IDPAY_ONBOARDING_FAILURE
    });
  };

  const exitOnboarding = () => {
    navigation.pop();
  };

  return {
    navigateToInitiativeDetailsScreen,
    navigateToPDNDCriteriaScreen,
    navigateToSelfDeclarationsScreen,
    navigateToCompletionScreen,
    navigateToFailureScreen,
    exitOnboarding,
    pushNextMultiPage: pushMultiPage
  };
};

export { createActionsImplementation };

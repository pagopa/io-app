import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { IDPayDetailsRoutes } from "../../initiative/details/navigation";
import {
  IDPayOnboardingParamsList,
  IDPayOnboardingRoutes,
  IDPayOnboardingStackNavigationProp
} from "../navigation/navigator";
import { Context } from "./machine";

const createActionsImplementation = (
  rootNavigation: IOStackNavigationProp<AppParamsList, keyof AppParamsList>,
  onboardingNavigation: IDPayOnboardingStackNavigationProp<
    IDPayOnboardingParamsList,
    keyof IDPayOnboardingParamsList
  >
) => {
  const navigateToInitiativeDetailsScreen = (context: Context) => {
    if (context.serviceId === undefined) {
      throw new Error("serviceId is undefined");
    }

    onboardingNavigation.navigate(
      IDPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS,
      {
        serviceId: context.serviceId
      }
    );
  };

  const navigateToPDNDCriteriaScreen = () => {
    onboardingNavigation.navigate(
      IDPayOnboardingRoutes.IDPAY_ONBOARDING_PDNDACCEPTANCE
    );
  };

  const navigateToBoolSelfDeclarationsScreen = () => {
    onboardingNavigation.navigate(
      IDPayOnboardingRoutes.IDPAY_ONBOARDING_BOOL_SELF_DECLARATIONS
    );
  };
  const navigateToMultiSelfDeclarationsScreen = (context: Context) => {
    onboardingNavigation.navigate({
      name: IDPayOnboardingRoutes.IDPAY_ONBOARDING_MULTI_SELF_DECLARATIONS,
      key: String(context.multiConsentsPage)
    });
  };

  const navigateToCompletionScreen = () => {
    onboardingNavigation.navigate(
      IDPayOnboardingRoutes.IDPAY_ONBOARDING_COMPLETION
    );
  };

  const navigateToFailureScreen = () => {
    onboardingNavigation.navigate(
      IDPayOnboardingRoutes.IDPAY_ONBOARDING_FAILURE
    );
  };

  const navigateToInitiativeMonitoringScreen = (context: Context) => {
    if (context.initiative === undefined) {
      throw new Error("initiative is undefined");
    }

    rootNavigation.replace(IDPayDetailsRoutes.IDPAY_DETAILS_MAIN, {
      screen: IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING,
      params: {
        initiativeId: context.initiative.initiativeId
      }
    });
  };

  const exitOnboarding = () => {
    onboardingNavigation.pop();
  };

  return {
    navigateToInitiativeDetailsScreen,
    navigateToPDNDCriteriaScreen,
    navigateToBoolSelfDeclarationsScreen,
    navigateToMultiSelfDeclarationsScreen,
    navigateToCompletionScreen,
    navigateToFailureScreen,
    navigateToInitiativeMonitoringScreen,
    exitOnboarding
  };
};

export { createActionsImplementation };

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
import { Events } from "./events";
import { Context } from "./machine";

const skipNavigation = (event: Events) => {
  if (event.type === "GO_BACK") {
    return event.skipNavigation;
  }
  return false;
};

const createActionsImplementation = (
  rootNavigation: IOStackNavigationProp<AppParamsList, keyof AppParamsList>,
  onboardingNavigation: IDPayOnboardingStackNavigationProp<
    IDPayOnboardingParamsList,
    keyof IDPayOnboardingParamsList
  >
) => {
  const navigateToInitiativeDetailsScreen = (context: Context, event: any) => {
    if (skipNavigation(event)) {
      return;
    }
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

  const navigateToPDNDCriteriaScreen = (_: Context, event: any) => {
    if (skipNavigation(event)) {
      return;
    }

    onboardingNavigation.navigate(
      IDPayOnboardingRoutes.IDPAY_ONBOARDING_PDNDACCEPTANCE
    );
  };

  const navigateToBoolSelfDeclarationsScreen = (_: Context, event: any) => {
    if (skipNavigation(event)) {
      return;
    }

    onboardingNavigation.navigate(
      IDPayOnboardingRoutes.IDPAY_ONBOARDING_BOOL_SELF_DECLARATIONS
    );
  };
  const navigateToMultiSelfDeclarationsScreen = (
    context: Context,
    event: any
  ) => {
    if (skipNavigation(event)) {
      return;
    }

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

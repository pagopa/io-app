import { isOfType } from "typesafe-actions";
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
  navigation: IDPayOnboardingStackNavigationProp<
    IDPayOnboardingParamsList,
    keyof IDPayOnboardingParamsList
  >
) => {
  const navigateToInitiativeDetailsScreen = (context: Context) => {
    if (context.serviceId === undefined) {
      throw new Error("serviceId is undefined");
    }

    navigation.navigate(
      IDPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS,
      {
        serviceId: context.serviceId
      }
    );
  };

  const navigateToPDNDCriteriaScreen = () => {
    navigation.navigate(IDPayOnboardingRoutes.IDPAY_ONBOARDING_PDNDACCEPTANCE);
  };

  const navigateToBoolSelfDeclarationsScreen = () => {
    navigation.navigate(
      IDPayOnboardingRoutes.IDPAY_ONBOARDING_BOOL_SELF_DECLARATIONS
    );
  };
  const navigateToMultiSelfDeclarationsScreen = (context: Context) => {
    navigation.navigate({
      name: IDPayOnboardingRoutes.IDPAY_ONBOARDING_MULTI_SELF_DECLARATIONS,
      key: String(context.multiConsentsPage)
    });
  };

  const navigateToCompletionScreen = () => {
    navigation.navigate(IDPayOnboardingRoutes.IDPAY_ONBOARDING_COMPLETION);
  };

  const navigateToFailureScreen = () => {
    navigation.navigate(IDPayOnboardingRoutes.IDPAY_ONBOARDING_FAILURE);
  };

  const navigateToInitiativeMonitoringScreen = (context: Context) => {
    if (context.initiative === undefined) {
      throw new Error("initiative is undefined");
    }

    const parentNav:
      | IOStackNavigationProp<AppParamsList, keyof AppParamsList>
      | undefined = navigation.getParent();

    parentNav?.replace(IDPayDetailsRoutes.IDPAY_DETAILS_MAIN, {
      screen: IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING,
      params: {
        initiativeId: context.initiative.initiativeId
      }
    });
  };

  const exitOnboarding = () => {
    navigation.pop();
  };

  return {
    navigateToInitiativeDetailsScreen,
    navigateToPDNDCriteriaScreen,
    navigateToBoolSelfDeclarationsScreen,
    navigateToCompletionScreen,
    navigateToFailureScreen,
    navigateToInitiativeMonitoringScreen,
    exitOnboarding,
    navigateToMultiSelfDeclarationsScreen
  };
};

export { createActionsImplementation };

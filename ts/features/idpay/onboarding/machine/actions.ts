import * as O from "fp-ts/lib/Option";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { guardedNavigationAction } from "../../../../xstate/helpers/guardedNavigationAction";
import { IDPayDetailsRoutes } from "../../details/navigation";
import { IdPayOnboardingRoutes } from "../navigation/routes";
import * as Context from "./context";

export const createActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>
) => {
  const navigateToInitiativeDetailsScreen =
    guardedNavigationAction<Context.Context>(() =>
      navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
        screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS,
        params: {}
      })
    );

  const navigateToPdndCriteriaScreen = guardedNavigationAction(() =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_PDNDACCEPTANCE
    })
  );

  const navigateToBoolSelfDeclarationListScreen = guardedNavigationAction(() =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_BOOL_SELF_DECLARATIONS
    })
  );

  const navigateToMultiSelfDeclarationListScreen = guardedNavigationAction(() =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_MULTI_SELF_DECLARATIONS
    })
  );

  const navigateToCompletionScreen = () =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_COMPLETION
    });

  const navigateToFailureScreen = () =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_FAILURE
    });

  const navigateToInitiativeMonitoringScreen = (args: {
    context: Context.Context;
  }) => {
    if (O.isNone(args.context.initiative)) {
      throw new Error("Initiative is undefined");
    }

    const initiativeId = args.context.initiative.value.initiativeId;

    navigation.replace(IDPayDetailsRoutes.IDPAY_DETAILS_MAIN, {
      screen: IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING,
      params: {
        initiativeId
      }
    });
  };

  const closeOnboarding = () => {
    navigation.popToTop();
  };

  return {
    navigateToInitiativeDetailsScreen,
    navigateToPdndCriteriaScreen,
    navigateToBoolSelfDeclarationListScreen,
    navigateToMultiSelfDeclarationListScreen,
    navigateToCompletionScreen,
    navigateToFailureScreen,
    navigateToInitiativeMonitoringScreen,
    closeOnboarding
  };
};

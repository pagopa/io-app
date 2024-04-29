import * as O from "fp-ts/lib/Option";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { guardedNavigationAction } from "../../../../xstate/helpers/guardedNavigationAction";
import { refreshSessionToken } from "../../../fastLogin/store/actions/tokenRefreshActions";
import { IDPayDetailsRoutes } from "../../details/navigation";
import { IdPayOnboardingRoutes } from "../navigation/routes";
import * as Context from "./context";

const createActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>,
  dispatch: ReturnType<typeof useIODispatch>
) => {
  const handleSessionExpired = () => {
    dispatch(
      refreshSessionToken.request({
        withUserInteraction: true,
        showIdentificationModalAtStartup: false,
        showLoader: true
      })
    );
  };

  const navigateToInitiativeDetailsScreen = guardedNavigationAction(() =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_NAVIGATOR, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS
    })
  );

  const navigateToPDNDCriteriaScreen = guardedNavigationAction(() =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_NAVIGATOR, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_PDNDACCEPTANCE
    })
  );

  const navigateToBoolSelfDeclarationsScreen = guardedNavigationAction(() =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_NAVIGATOR, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_BOOL_SELF_DECLARATIONS
    })
  );

  const navigateToMultiSelfDeclarationsScreen = guardedNavigationAction(
    (context: Context.Context) =>
      navigation.navigate({
        name: IdPayOnboardingRoutes.IDPAY_ONBOARDING_NAVIGATOR,
        params: {
          screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_MULTI_SELF_DECLARATIONS
        },
        key: String(context.multiConsentsPage)
      })
  );

  const navigateToCompletionScreen = () =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_NAVIGATOR, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_COMPLETION
    });

  const navigateToFailureScreen = () =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_NAVIGATOR, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_FAILURE
    });

  const navigateToInitiativeMonitoringScreen = (context: Context.Context) => {
    if (O.isNone(context.initiative)) {
      throw new Error("Initiative is undefined");
    }

    navigation.replace(IDPayDetailsRoutes.IDPAY_DETAILS_MAIN, {
      screen: IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING,
      params: {
        initiativeId: context.initiative.value.initiativeId
      }
    });
  };

  const closeOnboarding = () => {
    navigation.popToTop();
  };

  return {
    handleSessionExpired,
    navigateToInitiativeDetailsScreen,
    navigateToPDNDCriteriaScreen,
    navigateToBoolSelfDeclarationsScreen,
    navigateToMultiSelfDeclarationsScreen,
    navigateToCompletionScreen,
    navigateToFailureScreen,
    navigateToInitiativeMonitoringScreen,
    closeOnboarding
  };
};

export { createActionsImplementation };

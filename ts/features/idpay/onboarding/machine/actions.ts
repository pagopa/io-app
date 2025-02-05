import * as O from "fp-ts/lib/Option";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { refreshSessionToken } from "../../../fastLogin/store/actions/tokenRefreshActions";
import { IDPayDetailsRoutes } from "../../details/navigation";
import { IdPayOnboardingRoutes } from "../navigation/routes";
import * as Context from "./context";

export const createActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>,
  dispatch: ReturnType<typeof useIODispatch>
) => {
  const navigateToInitiativeDetailsScreen = () =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS,
      params: {}
    });
  const navigateToPdndCriteriaScreen = () =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_PDNDACCEPTANCE
    });
  const navigateToBoolSelfDeclarationListScreen = () =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_BOOL_SELF_DECLARATIONS
    });
  const navigateToMultiSelfDeclarationListScreen = () =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_MULTI_SELF_DECLARATIONS
    });
  const navigateToInputFormScreen = () =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_INPUT_FORM
    });

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

  const handleSessionExpired = () => {
    dispatch(
      refreshSessionToken.request({
        withUserInteraction: true,
        showIdentificationModalAtStartup: false,
        showLoader: true
      })
    );
  };

  return {
    navigateToInitiativeDetailsScreen,
    navigateToPdndCriteriaScreen,
    navigateToBoolSelfDeclarationListScreen,
    navigateToMultiSelfDeclarationListScreen,
    navigateToCompletionScreen,
    navigateToFailureScreen,
    navigateToInitiativeMonitoringScreen,
    navigateToInputFormScreen,
    closeOnboarding,
    handleSessionExpired
  };
};

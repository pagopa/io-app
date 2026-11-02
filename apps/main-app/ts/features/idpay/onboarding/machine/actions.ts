import * as O from "fp-ts/lib/Option";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { refreshSessionToken } from "../../../authentication/fastLogin/store/actions/tokenRefreshActions";
import { SERVICES_ROUTES } from "../../../services/common/navigation/routes";
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
      params: {},
      pop: true
    });
  const navigateToPdndCriteriaScreen = () =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_PDNDACCEPTANCE,
      pop: true
    });
  const navigateToBoolSelfDeclarationListScreen = () =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_BOOL_SELF_DECLARATIONS,
      pop: true
    });
  const navigateToMultiSelfDeclarationListScreen = () =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_MULTI_SELF_DECLARATIONS,
      pop: true
    });
  const navigateToInputFormScreen = () =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_INPUT_FORM,
      pop: true
    });

  const navigateToCompletionScreen = () =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_COMPLETION,
      pop: true
    });

  const navigateToFailureScreen = () =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_FAILURE,
      pop: true
    });

  const navigateToFailureToRetryScreen = () =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_FAILURE_TO_RETRY,
      pop: true
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

  const navigateToEnableNotificationScreen = () =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_ENABLE_NOTIFICATIONS,
      pop: true
    });

  const navigateToEnableMessageScreen = () =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_ENABLE_MESSAGE,
      pop: true
    });

  const closeOnboarding = () => navigation.popToTop();

  const closeOnboardingSuccess = () =>
    navigation.navigate(SERVICES_ROUTES.SERVICES_HOME, undefined, {
      pop: true
    });

  const navigateToLoadingScreen = () =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_LOADING,
      pop: true
    });

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
    navigateToFailureToRetryScreen,
    navigateToInitiativeMonitoringScreen,
    navigateToInputFormScreen,
    navigateToEnableNotificationScreen,
    navigateToEnableMessageScreen,
    navigateToLoadingScreen,
    closeOnboarding,
    closeOnboardingSuccess,
    handleSessionExpired
  };
};

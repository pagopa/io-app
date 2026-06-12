import * as O from "fp-ts/lib/Option";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIODispatch } from "../../../../store/hooks";
import { refreshSessionToken } from "../../../authentication/fastLogin/store/actions/tokenRefreshActions";
import { SERVICES_ROUTES } from "../../../services/common/navigation/routes";
import { IDPayDetailsRoutes } from "../../details/navigation";
import { IdPayOnboardingRoutes } from "../navigation/routes";
import * as Context from "./context";

type NavigationActionParams = { context: Context.Context };

const preventBackNavigation = (args: NavigationActionParams) =>
  args.context.navigationDirection === "back";

export const createActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>,
  dispatch: ReturnType<typeof useIODispatch>
) => {
  const navigateToInitiativeDetailsScreen = ({
    context
  }: NavigationActionParams) => {
    if (preventBackNavigation({ context })) {
      return;
    }
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS,
      params: {}
    });
  };
  const navigateToPdndCriteriaScreen = ({
    context
  }: NavigationActionParams) => {
    if (preventBackNavigation({ context })) {
      return;
    }
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_PDNDACCEPTANCE
    });
  };
  const navigateToBoolSelfDeclarationListScreen = ({
    context
  }: NavigationActionParams) => {
    if (preventBackNavigation({ context })) {
      return;
    }
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_BOOL_SELF_DECLARATIONS
    });
  };
  const navigateToMultiSelfDeclarationListScreen = ({
    context
  }: NavigationActionParams) => {
    if (preventBackNavigation({ context })) {
      return;
    }
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_MULTI_SELF_DECLARATIONS
    });
  };
  const navigateToInputFormScreen = ({ context }: NavigationActionParams) => {
    if (preventBackNavigation({ context })) {
      return;
    }
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_INPUT_FORM
    });
  };

  const navigateToCompletionScreen = () =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_COMPLETION
    });

  const navigateToFailureScreen = () =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_FAILURE
    });

  const navigateToFailureToRetryScreen = () =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_FAILURE_TO_RETRY
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
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_ENABLE_NOTIFICATIONS
    });

  const navigateToEnableMessageScreen = () =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_ENABLE_MESSAGE
    });

  const closeOnboarding = () => navigation.popToTop();

  const closeOnboardingSuccess = () =>
    navigation.navigate(ROUTES.MAIN, {
      screen: SERVICES_ROUTES.SERVICES_HOME
    });

  const navigateToLoadingScreen = () =>
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_LOADING
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

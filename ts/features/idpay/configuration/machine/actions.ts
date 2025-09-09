import { IOToast } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { refreshSessionToken } from "../../../authentication/fastLogin/store/actions/tokenRefreshActions";
import { IDPayDetailsRoutes } from "../../details/navigation";
import { IdPayConfigurationRoutes } from "../navigation/routes";
import { InitiativeFailure } from "../types/failure";
import * as Context from "./context";

const createActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>,
  dispatch: ReturnType<typeof useIODispatch>
) => {
  const navigateToConfigurationIntro = () => {
    navigation.navigate(
      IdPayConfigurationRoutes.IDPAY_CONFIGURATION_NAVIGATOR,
      {
        screen: IdPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO,
        params: {}
      }
    );
  };
  const navigateToIbanEnrollmentScreen = () =>
    navigation.navigate(
      IdPayConfigurationRoutes.IDPAY_CONFIGURATION_NAVIGATOR,
      {
        screen: IdPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ENROLLMENT,
        params: {}
      }
    );
  const navigateToIbanOnboardingScreen = () =>
    navigation.navigate(
      IdPayConfigurationRoutes.IDPAY_CONFIGURATION_NAVIGATOR,
      {
        screen: IdPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_LANDING
      }
    );
  const navigateToIbanOnboardingFormScreen = () =>
    navigation.navigate(
      IdPayConfigurationRoutes.IDPAY_CONFIGURATION_NAVIGATOR,
      {
        screen: IdPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ONBOARDING
      }
    );
  const navigateToInstrumentsEnrollmentScreen = () =>
    navigation.navigate(
      IdPayConfigurationRoutes.IDPAY_CONFIGURATION_NAVIGATOR,
      {
        screen:
          IdPayConfigurationRoutes.IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT,
        params: {}
      }
    );
  const navigateToConfigurationSuccessScreen = () => {
    navigation.navigate(
      IdPayConfigurationRoutes.IDPAY_CONFIGURATION_NAVIGATOR,
      {
        screen: IdPayConfigurationRoutes.IDPAY_CONFIGURATION_SUCCESS
      }
    );
  };

  const navigateToInitiativeDetailScreen = (args: {
    context: Context.Context;
  }) => {
    const initiativeId = args.context.initiativeId;
    navigation.navigate(IDPayDetailsRoutes.IDPAY_DETAILS_MAIN, {
      screen: IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING,
      params: { initiativeId }
    });
  };

  const showUpdateIbanToast = () => {
    IOToast.success(I18n.t(`idpay.configuration.iban.updateToast`));
  };

  const showFailureToast = (args: { context: Context.Context }) => {
    pipe(
      args.context.failure,
      InitiativeFailure.decode,
      O.fromEither,
      O.map(failure => I18n.t(`idpay.configuration.failureStates.${failure}`)),
      O.map(IOToast.error)
    );
  };

  const exitConfiguration = () => {
    navigation.pop();
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
    navigateToConfigurationIntro,
    navigateToIbanEnrollmentScreen,
    navigateToIbanOnboardingScreen,
    navigateToIbanOnboardingFormScreen,
    navigateToInstrumentsEnrollmentScreen,
    navigateToConfigurationSuccessScreen,
    navigateToInitiativeDetailScreen,
    showUpdateIbanToast,
    showFailureToast,
    exitConfiguration,
    handleSessionExpired
  };
};

export { createActionsImplementation };

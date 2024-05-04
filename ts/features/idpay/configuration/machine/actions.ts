import { IOToast } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { guardedNavigationAction } from "../../../../xstate/helpers/guardedNavigationAction";
import { IDPayDetailsRoutes } from "../../details/navigation";
import { IdPayConfigurationRoutes } from "../navigation/routes";
import { InitiativeFailure } from "../types/failure";
import * as Context from "./context";

const createActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>
) => {
  const navigateToConfigurationIntro = guardedNavigationAction<Context.Context>(
    () => {
      navigation.navigate(
        IdPayConfigurationRoutes.IDPAY_CONFIGURATION_NAVIGATOR,
        {
          screen: IdPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO,
          params: {}
        }
      );
    }
  );

  const navigateToIbanEnrollmentScreen = guardedNavigationAction(() =>
    navigation.navigate(
      IdPayConfigurationRoutes.IDPAY_CONFIGURATION_NAVIGATOR,
      {
        screen: IdPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ENROLLMENT,
        params: {}
      }
    )
  );

  const navigateToIbanOnboardingScreen = guardedNavigationAction(() =>
    navigation.navigate(
      IdPayConfigurationRoutes.IDPAY_CONFIGURATION_NAVIGATOR,
      {
        screen: IdPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_LANDING
      }
    )
  );

  const navigateToIbanOnboardingFormScreen = guardedNavigationAction(() =>
    navigation.navigate(
      IdPayConfigurationRoutes.IDPAY_CONFIGURATION_NAVIGATOR,
      {
        screen: IdPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ONBOARDING
      }
    )
  );

  const navigateToInstrumentsEnrollmentScreen = guardedNavigationAction(() =>
    navigation.navigate(
      IdPayConfigurationRoutes.IDPAY_CONFIGURATION_NAVIGATOR,
      {
        screen:
          IdPayConfigurationRoutes.IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT,
        params: {}
      }
    )
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
    exitConfiguration
  };
};

export { createActionsImplementation };

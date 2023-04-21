import * as O from "fp-ts/lib/Option";
import I18n from "../../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../../navigation/routes";
import { showToast } from "../../../../../utils/showToast";
import { guardedNavigationAction } from "../../../common/xstate/utils";
import { IDPayDetailsRoutes } from "../../details/navigation";
import { IDPayConfigurationRoutes } from "../navigation/navigator";
import { Context } from "./context";
import { Events } from "./events";
import { InitiativeFailureType } from "./failure";

const createActionsImplementation = (
  navigation: IOStackNavigationProp<AppParamsList, keyof AppParamsList>
) => {
  const navigateToConfigurationIntro = guardedNavigationAction(
    (context: Context) => {
      if (context.initiativeId === undefined) {
        throw new Error("initiativeId is undefined");
      }

      navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
        screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO,
        params: {
          initiativeId: context.initiativeId
        }
      });
    }
  );

  const navigateToIbanLandingScreen = guardedNavigationAction(() =>
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_LANDING
    })
  );

  const navigateToIbanOnboardingScreen = guardedNavigationAction(() =>
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ONBOARDING
    })
  );

  const navigateToIbanEnrollmentScreen = guardedNavigationAction(() =>
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ENROLLMENT,
      params: {}
    })
  );

  const navigateToAddPaymentMethodScreen = guardedNavigationAction(() =>
    navigation.replace(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.WALLET_ADD_PAYMENT_METHOD,
      params: { inPayment: O.none }
    })
  );

  const navigateToInstrumentsEnrollmentScreen = guardedNavigationAction(() =>
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen:
        IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT,
      params: {}
    })
  );

  const navigateToConfigurationSuccessScreen = () => {
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_SUCCESS
    });
  };

  const navigateToInitiativeDetailScreen = (context: Context) => {
    if (context.initiativeId === undefined) {
      throw new Error("initiativeId is undefined");
    }

    navigation.navigate(IDPayDetailsRoutes.IDPAY_DETAILS_MAIN, {
      screen: IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING,
      params: { initiativeId: context.initiativeId }
    });
  };

  const showFailureToast = (context: Context) => {
    if (context.failure === undefined) {
      return;
    }
    showToast(
      I18n.t(`idpay.configuration.failureStates.${context.failure}`),
      "danger"
    );
  };

  const showUpdateIbanToast = () => {
    showToast(I18n.t(`idpay.configuration.iban.updateToast`), "success");
  };

  const showInstrumentFailureToast = (_: Context, event: Events) => {
    switch (event.type) {
      case "ENROLL_INSTRUMENT_FAILURE":
        showToast(
          I18n.t(
            `idpay.configuration.failureStates.${InitiativeFailureType.INSTRUMENT_ENROLL_FAILURE}`
          ),
          "danger"
        );
        break;
      case "DELETE_INSTRUMENT_FAILURE":
        showToast(
          I18n.t(
            `idpay.configuration.failureStates.${InitiativeFailureType.INSTRUMENT_DELETE_FAILURE}`
          ),
          "danger"
        );
        break;
    }
  };

  const exitConfiguration = () => {
    navigation.pop();
  };

  return {
    navigateToConfigurationIntro,
    navigateToIbanLandingScreen,
    navigateToIbanOnboardingScreen,
    navigateToIbanEnrollmentScreen,
    navigateToInstrumentsEnrollmentScreen,
    navigateToAddPaymentMethodScreen,
    navigateToInitiativeDetailScreen,
    navigateToConfigurationSuccessScreen,
    showFailureToast,
    showUpdateIbanToast,
    showInstrumentFailureToast,
    exitConfiguration
  };
};

export { createActionsImplementation };

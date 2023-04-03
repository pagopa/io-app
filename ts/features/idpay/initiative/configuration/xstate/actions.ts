import * as O from "fp-ts/lib/Option";
import I18n from "../../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../../navigation/routes";
import { showToast } from "../../../../../utils/showToast";
import { IDPayDetailsRoutes } from "../../details/navigation";
import { IDPayConfigurationRoutes } from "../navigation/navigator";
import { Context } from "./context";
import { InitiativeFailureType } from "./failure";

const createActionsImplementation = (
  navigation: IOStackNavigationProp<AppParamsList, keyof AppParamsList>
) => {
  const navigateToConfigurationIntro = (context: Context) => {
    if (context.initiativeId === undefined) {
      throw new Error("initiativeId is undefined");
    }

    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO,
      params: {
        initiativeId: context.initiativeId
      }
    });
  };

  const navigateToIbanLandingScreen = () => {
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_LANDING
    });
  };

  const navigateToIbanOnboardingScreen = () => {
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ONBOARDING
    });
  };

  const navigateToIbanEnrollmentScreen = () => {
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ENROLLMENT,
      params: {}
    });
  };

  const navigateToAddPaymentMethodScreen = () => {
    navigation.replace(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.WALLET_ADD_PAYMENT_METHOD,
      params: { inPayment: O.none }
    });
  };

  const navigateToInstrumentsEnrollmentScreen = () => {
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen:
        IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT,
      params: {}
    });
  };

  const navigateToConfigurationSuccessScreen = () => {
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_SUCCESS
    });
  };

  const navigateToInitiativeDetailScreen = (context: Context) => {
    if (context.initiativeId === undefined) {
      return;
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
    if (context.failure in InitiativeFailureType) {
      showToast(
        I18n.t(`idpay.configuration.failureStates.${context.failure}`),
        "danger"
      );
    } else {
      showToast(I18n.t("idpay.configuration.failureStates.GENERIC"), "danger");
    }
  };

  const showUpdateIbanToast = () => {
    showToast(I18n.t(`idpay.configuration.iban.updateToast`), "success");
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
    exitConfiguration
  };
};

export { createActionsImplementation };

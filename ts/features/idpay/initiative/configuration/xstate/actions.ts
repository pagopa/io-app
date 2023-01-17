import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../navigation/params/AppParamsList";
import { IDPayDetailsRoutes } from "../../details/navigation";
import { IDPayConfigurationRoutes } from "../navigation/navigator";
import { Context } from "./context";

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

  const exitConfiguration = () => {
    navigation.pop();
  };

  return {
    navigateToConfigurationIntro,
    navigateToIbanLandingScreen,
    navigateToIbanOnboardingScreen,
    navigateToIbanEnrollmentScreen,
    navigateToInstrumentsEnrollmentScreen,
    navigateToConfigurationSuccessScreen,
    navigateToInitiativeDetailScreen,
    exitConfiguration
  };
};

export { createActionsImplementation };

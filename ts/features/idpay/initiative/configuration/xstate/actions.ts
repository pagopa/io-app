import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../../navigation/routes";
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

    navigation.navigate(ROUTES.IDPAY_INITIATIVE_DETAILS, {
      initiativeId: context.initiativeId
    });
  };

  const exitConfiguration = () => {
    navigation.pop();
  };
  const navigateToIbanLandingScreen = () => {
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen: IDPayConfigurationRoutes.IDPAY_IBAN_CONFIGURATION_LANDING
    });
  };
  const navigateToIbanOnboardingScreen = () => {
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen: IDPayConfigurationRoutes.IDPAY_IBAN_ONBOARDING
    });
  };

  return {
    navigateToConfigurationIntro,
    navigateToInstrumentsEnrollmentScreen,
    navigateToConfigurationSuccessScreen,
    navigateToInitiativeDetailScreen,
    exitConfiguration,
    navigateToIbanLandingScreen,
    navigateToIbanOnboardingScreen
  };
};

export { createActionsImplementation };

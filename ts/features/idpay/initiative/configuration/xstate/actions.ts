import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../../navigation/routes";
import { IDPayConfigurationRoutes } from "../navigation/navigator";
import { Context } from "./machine";

// TODO add actions implementatio
const createActionsImplementation = (
  navigation: IOStackNavigationProp<AppParamsList, keyof AppParamsList>
) => {
  const navigateToInstrumentsSelectionScreen = () => {
    // TODO navigate to instruments selection screen
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

  return {
    navigateToInstrumentsSelectionScreen,
    navigateToConfigurationSuccessScreen,
    navigateToInitiativeDetailScreen
  };
};

export { createActionsImplementation };

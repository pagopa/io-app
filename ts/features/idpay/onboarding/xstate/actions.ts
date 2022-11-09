import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { IDPayOnboardingRoutes } from "../navigation/navigator";

const createActionsImplementation = (
  navigation: IOStackNavigationProp<AppParamsList, keyof AppParamsList>
) => {
  const navigateToPDNDCriteriaScreen = () => {
    navigation.navigate(IDPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IDPayOnboardingRoutes.IDPAY_ONBOARDING_PDNDACCEPTANCE
    });
  };

  return { navigateToPDNDCriteriaScreen };
};

export { createActionsImplementation };

import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { IDPayAuthorizationRoutes } from "../navigation/navigator";

const createActionsImplementation = (
  navigation: IOStackNavigationProp<AppParamsList, keyof AppParamsList>
) => {
  const navigateToConfirmationScreen = () => {
    navigation.navigate(IDPayAuthorizationRoutes.IDPAY_AUTHORIZATION_MAIN, {
      screen: IDPayAuthorizationRoutes.IDPAY_AUTHORIZATION_CONFIRM
    });
  };

  const navigateToResultScreen = () =>
    navigation.navigate(IDPayAuthorizationRoutes.IDPAY_AUTHORIZATION_MAIN, {
      screen: IDPayAuthorizationRoutes.IDPAY_AUTHORIZATION_RESULT
    });

  const exitAuthorization = () => {
    navigation.pop();
  };

  return {
    navigateToConfirmationScreen,
    navigateToResultScreen,
    exitAuthorization
  };
};

export { createActionsImplementation };

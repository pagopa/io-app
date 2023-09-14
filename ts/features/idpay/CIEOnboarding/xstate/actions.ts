/* eslint-disable no-console */
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";

const createActionsImplementation = (
  navigation: IOStackNavigationProp<AppParamsList, keyof AppParamsList>,
  dispatch: ReturnType<typeof useIODispatch>
) => {
  const authorizeUser = () => {
    // CALL AUTH HOOK
    console.log("authorizeUser");
  };

  const navigateToPinShowScreen = () => {
    // navigation.navigate
    console.log("navigateToPinShowScreen");
  };
  const navigateToErrorScreen = () => {
    // navigation.navigate
    console.log("navigateToErrorScreen");
  };
  const navigateToSuccessScreen = () => {
    // navigation.navigate
    console.log("navigateToSuccessScreen");
  };
  const quitFlow = () => {
    navigation.pop();
  };
  return {
    authorizeUser,
    navigateToPinShowScreen,
    navigateToErrorScreen,
    navigateToSuccessScreen,
    quitFlow
  };
};

export { createActionsImplementation };

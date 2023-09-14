/* eslint-disable no-console */
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";

const createActionsImplementation = (
  navigation: IOStackNavigationProp<AppParamsList, keyof AppParamsList>
) => {
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
    navigateToPinShowScreen,
    navigateToErrorScreen,
    navigateToSuccessScreen,
    quitFlow
  };
};

export { createActionsImplementation };

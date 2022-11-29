import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../navigation/params/AppParamsList";

// TODO add actions implementatio
const createActionsImplementation = (
  _navigation: IOStackNavigationProp<AppParamsList, keyof AppParamsList>
) => {
  const navigateToInstrumentsSelectionScreen = () => {
    // ....
    console.log("navigateToInstrumentsSelectionScreen");
  };

  return { navigateToInstrumentsSelectionScreen };
};

export { createActionsImplementation };

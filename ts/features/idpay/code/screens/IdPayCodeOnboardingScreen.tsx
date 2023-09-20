import * as React from "react";
import { View } from "react-native";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isIdPayCodeOnboardedSelector } from "../store/selectors";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";

const IdPayCodeOnboardingScreen = () => {
  const dispatch = useIODispatch();

  const isCodeOnboarded = useIOSelector(isIdPayCodeOnboardedSelector);

  return <BaseScreenComponent></BaseScreenComponent>;
};

export { IdPayCodeOnboardingScreen };

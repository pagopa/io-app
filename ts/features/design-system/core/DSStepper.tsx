import {
  H3,
  IOVisualCostants,
  Stepper,
  VSpacer,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

export const DSStepper = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title={"Stepper"} noMargin>
      <View style={{ paddingHorizontal: IOVisualCostants.appMarginDefault }}>
        <H3 color={theme["textHeading-default"]} weight={"SemiBold"}>
          Stepper
        </H3>
      </View>
      <View style={{ paddingTop: IOVisualCostants.appMarginDefault }}>
        <VSpacer size={24} />
        <Stepper steps={8} currentStep={1} />
        <VSpacer size={24} />
        <Stepper steps={6} currentStep={4} />
        <VSpacer size={24} />
        <Stepper steps={4} currentStep={4} />
        <VSpacer size={24} />
        <Stepper steps={5} currentStep={1} />
      </View>
    </DesignSystemScreen>
  );
};

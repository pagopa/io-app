import {
  H4,
  IOVisualCostants,
  Stepper,
  useIOTheme,
  VStack
} from "@io-app/design-system";
import { View } from "react-native";

import { DesignSystemScreen } from "../components/DesignSystemScreen";

const componentMargin = 24;
const sectionTitleMargin = 16;

export const DSStepper = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen noMargin title={"Stepper"}>
      <VStack space={sectionTitleMargin}>
        <View style={{ paddingHorizontal: IOVisualCostants.appMarginDefault }}>
          <H4 color={theme["textHeading-default"]}>Stepper</H4>
        </View>
        <VStack space={componentMargin}>
          <Stepper currentStep={1} steps={8} />
          <Stepper currentStep={4} steps={6} />
          <Stepper currentStep={4} steps={4} />
          <Stepper currentStep={1} steps={5} />
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};

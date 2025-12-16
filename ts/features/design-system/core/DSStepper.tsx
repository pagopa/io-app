import {
  H4,
  IOVisualCostants,
  Stepper,
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const componentMargin = 24;
const sectionTitleMargin = 16;

export const DSStepper = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title={"Stepper"} noMargin>
      <VStack space={sectionTitleMargin}>
        <View style={{ paddingHorizontal: IOVisualCostants.appMarginDefault }}>
          <H4 color={theme["textHeading-default"]}>Stepper</H4>
        </View>
        <VStack space={componentMargin}>
          <Stepper steps={8} currentStep={1} />
          <Stepper steps={6} currentStep={4} />
          <Stepper steps={4} currentStep={4} />
          <Stepper steps={5} currentStep={1} />
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};

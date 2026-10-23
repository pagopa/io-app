import { View } from "react-native";

import { useIOColors } from "../../context";
import { IODimensions } from "../../core";

type StepperProps = {
  currentStep: number;
  steps: number;
};

export const Stepper = ({ steps, currentStep }: StepperProps) => {
  const stepperColors = useIOColors().component.stepper;

  return (
    <View style={{ paddingHorizontal: IODimensions.padding.screen.default }}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          gap: IODimensions.gap.stepper.items
        }}
      >
        {[...Array(steps)].map((_, i) => (
          <View
            key={i}
            style={{
              /* Rounded ends */
              borderRadius: IODimensions.stroke.stepper,
              borderCurve: "continuous",
              borderBottomColor:
                i > currentStep - 1
                  ? stepperColors.default
                  : stepperColors.active,
              borderBottomWidth: IODimensions.stroke.stepper,
              flex: 1
            }}
          />
        ))}
      </View>
    </View>
  );
};

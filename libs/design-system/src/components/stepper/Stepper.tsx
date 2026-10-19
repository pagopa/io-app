import { ColorValue, View } from "react-native";

import { useIOTheme } from "../../context";
import { IOColorsLegacy, IODimensions } from "../../core";

type StepperProps = {
  currentStep: number;
  steps: number;
};

export const Stepper = ({ steps, currentStep }: StepperProps) => {
  const theme = useIOTheme();

  const colorMap: Record<string, ColorValue> = {
    default: IOColorsLegacy[theme["stepper-default"]],
    active: IOColorsLegacy[theme["interactiveElem-default"]]
  };

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
                i > currentStep - 1 ? colorMap.default : colorMap.active,
              borderBottomWidth: IODimensions.stroke.stepper,
              flex: 1
            }}
          />
        ))}
      </View>
    </View>
  );
};

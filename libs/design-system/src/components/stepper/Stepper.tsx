import { ColorValue, View } from "react-native";

import { useIOTheme } from "../../context";
import { IOColors, IODimensions, IOSpace } from "../../core";

type StepperProps = {
  currentStep: number;
  steps: number;
};

export const Stepper = ({ steps, currentStep }: StepperProps) => {
  const theme = useIOTheme();

  const STEPPER_SPACE: IOSpace = 4;

  const colorMap: Record<string, ColorValue> = {
    default: IOColors[theme["stepper-default"]],
    active: IOColors[theme["interactiveElem-default"]]
  };

  return (
    <View style={{ paddingHorizontal: IODimensions.padding.screen.default }}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          gap: STEPPER_SPACE
        }}
      >
        {[...Array(steps)].map((_, i) => (
          <View
            key={i}
            style={{
              borderRadius: 2,
              borderCurve: "continuous",
              borderBottomColor:
                i > currentStep - 1 ? colorMap.default : colorMap.active,
              borderBottomWidth: 2,
              flex: 1
            }}
          />
        ))}
      </View>
    </View>
  );
};

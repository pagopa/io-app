import { ComponentProps, useState } from "react";
import { Pressable, View } from "react-native";

import { useIOColors } from "../../context";
import { IODimensions, IOOpacity } from "../../core";
import { triggerHaptic } from "../../functions/haptic-feedback/hapticFeedback";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { H6 } from "../typography/H6";
import { Radio } from "./Radio";

type Props = {
  label: string;
  // dispatch the new value after the radio button changes state
  onValueChange?: (newValue: boolean) => void;
};

type RadioButtonLabelProps = Pick<
  ComponentProps<typeof Pressable>,
  "accessibilityHint" | "accessibilityLabel" | "onPress"
> &
  Pick<ComponentProps<typeof Radio>, "checked" | "disabled"> &
  Props;

/**
 * A radio button with the automatic state management that uses a {@link Radio}
 * The toggleValue change when a `onPress` event is received and dispatch the
 * `onValueChange`.
 *
 * @class
 * @param props
 */
export const RadioButtonLabel = ({
  label,
  checked,
  disabled,
  onValueChange,
  accessibilityLabel,
  accessibilityHint
}: RadioButtonLabelProps) => {
  const { dynamicFontScale, spacingScaleMultiplier } = useIOFontDynamicScale();
  const radioColors = useIOColors().component.radio;

  const [toggleValue, setToggleValue] = useState(checked ?? false);

  const toggleRadioButton = () => {
    triggerHaptic("impactLight");
    setToggleValue(!toggleValue);
    if (onValueChange !== undefined) {
      onValueChange(!toggleValue);
    }
  };

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="radio"
      accessibilityState={{
        checked: checked ?? toggleValue,
        disabled: !!disabled
      }}
      disabled={disabled}
      onPress={toggleRadioButton}
      style={{
        alignSelf: "flex-start",
        opacity: disabled ? IOOpacity.disabled : 1
      }}
      testID="RadioButton"
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          flexShrink: 1,
          width: "100%",
          columnGap:
            IODimensions.gap.selection.control *
            dynamicFontScale *
            spacingScaleMultiplier
        }}
      >
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
        >
          <Radio
            checked={checked ?? toggleValue}
            size={IODimensions.size.selection.control * dynamicFontScale}
          />
        </View>
        <H6 color={radioColors.label} style={{ flexShrink: 1 }}>
          {label}
        </H6>
      </View>
    </Pressable>
  );
};

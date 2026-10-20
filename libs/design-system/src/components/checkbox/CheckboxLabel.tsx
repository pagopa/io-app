import { ComponentProps, useState } from "react";
import { Pressable, View } from "react-native";

import { useIOTheme } from "../../context";
import { IODimensions, IOOpacity } from "../../core";
import { triggerHaptic } from "../../functions/haptic-feedback/hapticFeedback";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { HStack } from "../layout";
import { H6 } from "../typography/H6";
import { Checkbox } from "./Checkbox";

// disabled: the component is no longer touchable
// onPress:
type OwnProps = Pick<ComponentProps<typeof Checkbox>, "checked" | "disabled"> &
  Pick<ComponentProps<typeof Pressable>, "onPress"> &
  Props;

type Props = {
  label: string;
  // dispatch the new value after the checkbox changes state
  onValueChange?: (newValue: boolean) => void;
};

/**
 * A checkbox with the automatic state management that uses a {@link Checkbox}
 * The toggleValue change when a `onPress` event is received and dispatch the
 * `onValueChange`.
 *
 * @class
 * @param props
 */
export const CheckboxLabel = ({
  label,
  checked,
  disabled,
  onValueChange
}: OwnProps) => {
  const theme = useIOTheme();
  const { dynamicFontScale } = useIOFontDynamicScale();

  const [toggleValue, setToggleValue] = useState(checked ?? false);

  const toggleCheckbox = () => {
    triggerHaptic("impactLight");
    setToggleValue(!toggleValue);
    if (onValueChange !== undefined) {
      onValueChange(!toggleValue);
    }
  };

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{
        checked: checked ?? toggleValue,
        disabled: !!disabled
      }}
      disabled={disabled}
      // This is required to avoid opacity
      // inheritance on Android
      needsOffscreenAlphaCompositing={true}
      onPress={toggleCheckbox}
      style={{
        alignSelf: "flex-start",
        opacity: disabled ? IOOpacity.disabled : 1
      }}
      testID="Checkbox"
    >
      <HStack
        allowScaleSpacing
        space={IODimensions.gap.selection.control}
        style={{ alignItems: "center", width: "100%" }}
      >
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
          style={{
            alignSelf: "flex-start"
          }}
        >
          <Checkbox
            checked={checked ?? toggleValue}
            size={IODimensions.size.selection.control * dynamicFontScale}
          />
        </View>
        <H6 color={theme["textBody-default"]} style={{ flexShrink: 1 }}>
          {label}
        </H6>
      </HStack>
    </Pressable>
  );
};

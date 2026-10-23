import { ComponentProps, useState } from "react";
import { Pressable, View } from "react-native";
import Animated from "react-native-reanimated";

import { useIOColors } from "../../context";
import { IODimensions, IOOpacity, IOSelectionListItemStyles } from "../../core";
import { triggerHaptic } from "../../functions";
import { useListItemAnimation } from "../../hooks";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { Checkbox } from "../checkbox/Checkbox";
import { Icon, IOIcons } from "../icons";
import { HSpacer, VSpacer } from "../layout";
import { BodySmall, H6 } from "../typography";

type ListItemCheckboxProps = Pick<
  ComponentProps<typeof Pressable>,
  "accessibilityHint" | "accessibilityLabel" | "disabled" | "onPress"
> &
  Props;

type Props = {
  description?: string;
  icon?: IOIcons;
  onValueChange?: (newValue: boolean) => void;
  selected?: boolean;
  value: string;
};

/**
 * With the automatic state management that uses a {@link AnimatedCheckBox} The
 * toggleValue change when a `onPress` event is received and dispatch the
 * `onValueChange`.
 *
 * @class
 * @param props
 */
export const ListItemCheckbox = ({
  value,
  description,
  icon,
  selected,
  accessibilityLabel,
  accessibilityHint,
  disabled,
  onValueChange
}: ListItemCheckboxProps) => {
  const { dynamicFontScale, spacingScaleMultiplier, hugeFontEnabled } =
    useIOFontDynamicScale();

  const [toggleValue, setToggleValue] = useState(selected ?? false);
  const { onPressIn, onPressOut, scaleAnimatedStyle, backgroundAnimatedStyle } =
    useListItemAnimation();

  const listItemColors = useIOColors().component.listItem;

  // Accessibility
  // Comma = Small pause when announcing content
  const fallbackAccessibilityLabel = description
    ? `${value}, ${description}`
    : value;

  const toggleCheckbox = () => {
    triggerHaptic("impactLight");
    setToggleValue(!toggleValue);
    if (onValueChange !== undefined) {
      onValueChange(!toggleValue);
    }
  };

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel || fallbackAccessibilityLabel}
      accessibilityRole="checkbox"
      accessibilityState={{
        checked: selected ?? toggleValue,
        disabled: !!disabled
      }}
      accessible={true}
      disabled={disabled}
      onPress={toggleCheckbox}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      testID="ListItemCheckbox"
    >
      <Animated.View
        // This is required to avoid opacity
        // inheritance on Android
        needsOffscreenAlphaCompositing={true}
        style={[
          IOSelectionListItemStyles.listItem,
          backgroundAnimatedStyle,
          { opacity: disabled ? IOOpacity.disabled : 1 }
        ]}
      >
        <Animated.View style={scaleAnimatedStyle}>
          <View style={IOSelectionListItemStyles.listItemInner}>
            <View
              style={{
                flexDirection: "row",
                flexShrink: 1,
                columnGap:
                  IODimensions.gap.selection.leading *
                  dynamicFontScale *
                  spacingScaleMultiplier
              }}
            >
              {icon && !hugeFontEnabled && (
                <Icon
                  allowFontScaling
                  color={listItemColors.foreground.icon}
                  name={icon}
                  size={IODimensions.size.icon.selection}
                />
              )}
              <H6
                color={listItemColors.foreground.label}
                style={{ flexShrink: 1 }}
              >
                {value}
              </H6>
            </View>
            <HSpacer size={IODimensions.gap.selection.control} />
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              pointerEvents="none"
            >
              <Checkbox
                checked={selected ?? toggleValue}
                size={IODimensions.size.selection.control * dynamicFontScale}
              />
            </View>
          </View>
          {description && (
            <View>
              <VSpacer size={IODimensions.gap.selection.description} />
              <BodySmall
                color={listItemColors.foreground.description}
                weight="Regular"
              >
                {description}
              </BodySmall>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

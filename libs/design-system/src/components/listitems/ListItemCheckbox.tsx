import { ComponentProps, useState } from "react";
import { Pressable, View } from "react-native";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import Animated from "react-native-reanimated";

import { useIOTheme } from "../../context";
import {
  IOSelectionListItemStyles,
  IOSelectionListItemVisualParams,
  IOSelectionTickVisualParams
} from "../../core";
import { useListItemAnimation } from "../../hooks";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { AnimatedCheckbox } from "../checkbox/AnimatedCheckbox";
import { Icon, IOIcons } from "../icons";
import { HSpacer, VSpacer } from "../layout";
import { BodySmall, H6 } from "../typography";

type Props = {
  description?: string;
  icon?: IOIcons;
  onValueChange?: (newValue: boolean) => void;
  selected?: boolean;
  value: string;
};

const DISABLED_OPACITY = 0.5;

type ListItemCheckboxProps = Pick<
  ComponentProps<typeof Pressable>,
  "accessibilityHint" | "accessibilityLabel" | "disabled" | "onPress"
> &
  Props;

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

  // Theme
  const theme = useIOTheme();

  // Accessibility
  // Comma = Small pause when announcing content
  const fallbackAccessibilityLabel = description
    ? `${value}, ${description}`
    : value;

  const toggleCheckbox = () => {
    ReactNativeHapticFeedback.trigger("impactLight");
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
          { opacity: disabled ? DISABLED_OPACITY : 1 }
        ]}
      >
        <Animated.View style={scaleAnimatedStyle}>
          <View style={IOSelectionListItemStyles.listItemInner}>
            <View
              style={{
                flexDirection: "row",
                flexShrink: 1,
                columnGap:
                  IOSelectionListItemVisualParams.iconMargin *
                  dynamicFontScale *
                  spacingScaleMultiplier
              }}
            >
              {icon && !hugeFontEnabled && (
                <Icon
                  allowFontScaling
                  color={theme["icon-decorative"]}
                  name={icon}
                  size={IOSelectionListItemVisualParams.iconSize}
                />
              )}
              <H6 color={theme["textBody-default"]} style={{ flexShrink: 1 }}>
                {value}
              </H6>
            </View>
            <HSpacer size={8} />
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              pointerEvents="none"
            >
              <AnimatedCheckbox
                checked={selected ?? toggleValue}
                size={IOSelectionTickVisualParams.size * dynamicFontScale}
              />
            </View>
          </View>
          {description && (
            <View>
              <VSpacer
                size={IOSelectionListItemVisualParams.descriptionMargin}
              />
              <BodySmall color={theme["textBody-tertiary"]} weight="Regular">
                {description}
              </BodySmall>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

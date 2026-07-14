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
import { IOIcons, Icon } from "../icons";
import { HSpacer, VSpacer } from "../layout";
import { BodySmall, H6 } from "../typography";

type Props = {
  value: string;
  description?: string;
  icon?: IOIcons;
  selected?: boolean;
  onValueChange?: (newValue: boolean) => void;
};

const DISABLED_OPACITY = 0.5;

type ListItemCheckboxProps = Props &
  Pick<
    ComponentProps<typeof Pressable>,
    "onPress" | "accessibilityLabel" | "accessibilityHint" | "disabled"
  >;

/**
 *  with the automatic state management that uses a {@link AnimatedCheckBox}
 * The toggleValue change when a `onPress` event is received and dispatch the `onValueChange`.
 *
 * @param props
 * @constructor
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
      onPress={toggleCheckbox}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      testID="ListItemCheckbox"
      accessible={true}
      accessibilityLabel={accessibilityLabel || fallbackAccessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="checkbox"
      accessibilityState={{
        checked: selected ?? toggleValue,
        disabled: !!disabled
      }}
      disabled={disabled}
    >
      <Animated.View
        style={[
          IOSelectionListItemStyles.listItem,
          backgroundAnimatedStyle,
          { opacity: disabled ? DISABLED_OPACITY : 1 }
        ]}
        // This is required to avoid opacity
        // inheritance on Android
        needsOffscreenAlphaCompositing={true}
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
                  name={icon}
                  color={theme["icon-decorative"]}
                  size={IOSelectionListItemVisualParams.iconSize}
                />
              )}
              <H6 color={theme["textBody-default"]} style={{ flexShrink: 1 }}>
                {value}
              </H6>
            </View>
            <HSpacer size={8} />
            <View
              pointerEvents="none"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <AnimatedCheckbox
                size={IOSelectionTickVisualParams.size * dynamicFontScale}
                checked={selected ?? toggleValue}
              />
            </View>
          </View>
          {description && (
            <View>
              <VSpacer
                size={IOSelectionListItemVisualParams.descriptionMargin}
              />
              <BodySmall weight="Regular" color={theme["textBody-tertiary"]}>
                {description}
              </BodySmall>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  View,
  Text
} from "react-native";
import React, { useCallback } from "react";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { WithTestID } from "../../types/WithTestID";
import { Label } from "../core/typography/Label";
import {
  IOColors,
  IOColorsStatusBackground,
  IOColorsStatusForeground
} from "../core/variables/IOColors";
import { IOIcons, Icon } from "../core/icons";
import { HSpacer, VSpacer } from "../core/spacer/Spacer";
import { IOStyles } from "../core/variables/IOStyles";
import { IOAlertRadius } from "../core/variables/IOShapes";
import { IOAlertSpacing } from "../core/variables/IOSpacing";
import { NewH4 } from "../core/typography/NewH4";
import { IOScaleValues, IOSpringValues } from "../core/variables/IOAnimations";
import { makeFontStyleObject } from "../core/fonts";
import { useIOSelector } from "../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";

const iconSize: number = 24;
const [spacingDefault, spacingFullWidth] = IOAlertSpacing;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    alignContent: "center"
  },
  spacingDefault: {
    padding: spacingDefault,
    borderRadius: IOAlertRadius
  },
  spacingFullWidth: {
    padding: spacingFullWidth
  },
  label: {
    fontSize: 16,
    ...makeFontStyleObject("Regular", false, "ReadexPro")
  },
  /* REMOVE_LEGACY_COMPONENT: Start ▶ */
  labelLegacy: {
    fontSize: 16,
    ...makeFontStyleObject("Bold", false, "TitilliumWeb")
  }
  /* REMOVE_LEGACY_COMPONENT: End ▶ */
});

type AlertProps = WithTestID<{
  variant: "error" | "warning" | "info" | "success";
  title?: string;
  content: string;
  fullWidth?: boolean;
  viewRef: React.RefObject<View>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}>;

type AlertActionProps =
  | {
      action?: string;
      onPress: (event: GestureResponderEvent) => void;
    }
  | {
      action?: never;
      onPress?: never;
    };

export type Alert = AlertProps & AlertActionProps;

type VariantStates = {
  icon: IOIcons;
  background: IOColorsStatusBackground;
  foreground: IOColorsStatusForeground;
};

// COMPONENT CONFIGURATION

const mapVariantStates: Record<NonNullable<Alert["variant"]>, VariantStates> = {
  error: {
    icon: "errorFilled",
    background: "error-100",
    foreground: "error-850"
  },
  warning: {
    icon: "warningFilled",
    background: "warning-100",
    foreground: "warning-850"
  },
  info: {
    icon: "infoFilled",
    background: "info-100",
    foreground: "info-850"
  },
  success: {
    icon: "success",
    background: "success-100",
    foreground: "success-850"
  }
};

export const Alert = ({
  viewRef,
  variant,
  title,
  content,
  action,
  onPress,
  fullWidth = false,
  accessibilityHint,
  testID
}: Alert) => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);
  const isPressed: Animated.SharedValue<number> = useSharedValue(0);

  // Scaling transformation applied when the button is pressed
  const animationScaleValue = IOScaleValues?.magnifiedButton?.pressedState;

  // Using a spring-based animation for our interpolations
  const progressPressed = useDerivedValue(() =>
    withSpring(isPressed.value, IOSpringValues.button)
  );

  // Interpolate animation values from `isPressed` values
  const pressedAnimationStyle = useAnimatedStyle(() => {
    // Scale down button slightly when pressed
    const scale = interpolate(
      progressPressed.value,
      [0, 1],
      [1, animationScaleValue],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }]
    };
  });

  const onPressIn = useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 1;
  }, [isPressed]);
  const onPressOut = useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 0;
  }, [isPressed]);

  const renderMainBlock = () => (
    <>
      <Icon
        name={mapVariantStates[variant].icon}
        size={iconSize}
        color={mapVariantStates[variant].foreground}
      />
      <HSpacer />
      <View style={IOStyles.flex}>
        {title && (
          <>
            <NewH4 color={mapVariantStates[variant].foreground}>{title}</NewH4>
            <VSpacer size={8} />
          </>
        )}
        <Label
          color={mapVariantStates[variant].foreground}
          weight={"Regular"}
          accessibilityRole="text"
        >
          {content}
        </Label>
        {action && (
          <>
            <VSpacer size={8} />
            <Text
              style={[
                isDesignSystemEnabled ? styles.label : styles.labelLegacy,
                { color: IOColors[mapVariantStates[variant].foreground] }
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {action}
            </Text>
          </>
        )}
      </View>
    </>
  );

  const StaticComponent = () => (
    <View
      ref={viewRef}
      style={[
        styles.container,
        fullWidth ? styles.spacingFullWidth : styles.spacingDefault,
        { backgroundColor: IOColors[mapVariantStates[variant].background] }
      ]}
      testID={testID}
      accessible={false}
      accessibilityRole="alert"
      accessibilityHint={accessibilityHint}
    >
      {renderMainBlock()}
    </View>
  );

  const PressableButton = () => (
    <Pressable
      ref={viewRef}
      testID={testID}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      // A11y related props
      accessible={true}
      accessibilityHint={accessibilityHint}
      accessibilityRole={"button"}
    >
      <Animated.View
        style={[
          styles.container,
          fullWidth ? styles.spacingFullWidth : styles.spacingDefault,
          { backgroundColor: IOColors[mapVariantStates[variant].background] },
          // Disable pressed animation when component is full width
          !fullWidth && pressedAnimationStyle
        ]}
      >
        {renderMainBlock()}
      </Animated.View>
    </Pressable>
  );

  return action ? <PressableButton /> : <StaticComponent />;
};

import { RefObject, useMemo } from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  enterTransitionAlertEdgeToEdge,
  enterTransitionAlertEdgeToEdgeContent,
  exitTransitionAlertEdgeToEdge,
  IOVisualCostants
} from "../../core";
import {
  IOColors,
  IOColorsStatusBackground,
  IOColorsStatusForeground
} from "../../core/IOColors";
import { IOAlertSpacing } from "../../core/IOSpacing";
import { useScaleAnimation } from "../../hooks";
import { makeFontStyleObject } from "../../utils/fonts";
import { WithTestID } from "../../utils/types";
import { Icon, IOIcons, IOIconSizeScale } from "../icons";
import { Body } from "../typography";

const iconSize: IOIconSizeScale = 24;

const [spacingDefault] = IOAlertSpacing;

const styles = StyleSheet.create({
  alert: {
    flexDirection: "row",
    alignItems: "flex-start",
    alignContent: "center",
    padding: spacingDefault
  }
});

export type AlertEdgeToEdgeProps = AlertActionProps & AlertProps;

type AlertActionProps =
  | {
      action?: never;
      onPress?: never;
    }
  | {
      action?: string;
      onPress: (event: GestureResponderEvent) => void;
    };

type AlertProps = WithTestID<{
  accessibilityHint?: string;
  accessibilityLabel?: string;
  content: string;
  variant: "error" | "info" | "success" | "warning";
  viewRef?: RefObject<View>;
}>;

type VariantStates = {
  background: IOColorsStatusBackground;
  foreground: IOColorsStatusForeground;
  icon: IOIcons;
};

// COMPONENT CONFIGURATION

const mapVariantStates: Record<
  NonNullable<AlertEdgeToEdgeProps["variant"]>,
  VariantStates
> = {
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

export const AlertEdgeToEdge = ({
  variant,
  content,
  action,
  onPress,
  accessibilityHint,
  testID
}: AlertEdgeToEdgeProps) => {
  const { onPressIn, onPressOut, scaleAnimatedStyle } =
    useScaleAnimation("slight");
  const insets = useSafeAreaInsets();

  const backgroundColor = useMemo(
    () => IOColors[mapVariantStates[variant].background],
    [variant]
  );

  const renderMainBlock = () => (
    <>
      <View
        style={{
          marginRight: IOVisualCostants.iconMargin,
          alignSelf: "center"
        }}
      >
        <Icon
          color={mapVariantStates[variant].foreground}
          name={mapVariantStates[variant].icon}
          size={iconSize}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Body
          accessibilityRole="text"
          color={mapVariantStates[variant].foreground}
          weight={"Regular"}
        >
          {content}
          {action && (
            <Text
              style={{
                ...makeFontStyleObject(
                  16,
                  "TitilliumSansPro",
                  undefined,
                  "Bold"
                ),
                color: IOColors[mapVariantStates[variant].foreground]
              }}
            >
              {` ${action}`}
            </Text>
          )}
        </Body>
      </View>
    </>
  );

  const PressableButton = () => (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityRole={"button"}
      // A11y related props
      accessible={true}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      testID={testID}
    >
      <Animated.View
        entering={enterTransitionAlertEdgeToEdgeContent}
        style={[styles.alert, scaleAnimatedStyle]}
      >
        {renderMainBlock()}
      </Animated.View>
    </Pressable>
  );

  const StaticComponent = () => (
    <Animated.View
      accessibilityHint={accessibilityHint}
      accessibilityRole="alert"
      accessible={false}
      entering={enterTransitionAlertEdgeToEdgeContent}
      style={styles.alert}
      testID={testID}
    >
      {renderMainBlock()}
    </Animated.View>
  );

  return (
    <Animated.View
      entering={enterTransitionAlertEdgeToEdge}
      exiting={exitTransitionAlertEdgeToEdge}
      style={{
        paddingTop: insets.top,
        backgroundColor
      }}
    >
      {action ? PressableButton() : StaticComponent()}
    </Animated.View>
  );
};

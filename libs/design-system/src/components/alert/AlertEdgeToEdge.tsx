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
  IOVisualCostants,
  enterTransitionAlertEdgeToEdge,
  enterTransitionAlertEdgeToEdgeContent,
  exitTransitionAlertEdgeToEdge
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
import { IOIconSizeScale, IOIcons, Icon } from "../icons";
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

type AlertProps = WithTestID<{
  variant: "error" | "warning" | "info" | "success";
  content: string;
  viewRef?: RefObject<View>;
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

export type AlertEdgeToEdgeProps = AlertProps & AlertActionProps;

type VariantStates = {
  icon: IOIcons;
  background: IOColorsStatusBackground;
  foreground: IOColorsStatusForeground;
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
          name={mapVariantStates[variant].icon}
          size={iconSize}
          color={mapVariantStates[variant].foreground}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Body
          color={mapVariantStates[variant].foreground}
          weight={"Regular"}
          accessibilityRole="text"
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
      testID={testID}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      // A11y related props
      accessible={true}
      accessibilityHint={accessibilityHint}
      accessibilityRole={"button"}
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
      entering={enterTransitionAlertEdgeToEdgeContent}
      style={styles.alert}
      testID={testID}
      accessible={false}
      accessibilityRole="alert"
      accessibilityHint={accessibilityHint}
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

import { RefObject } from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useIOColors } from "../../context";
import {
  enterTransitionAlertEdgeToEdge,
  enterTransitionAlertEdgeToEdgeContent,
  exitTransitionAlertEdgeToEdge,
  IODimensions
} from "../../core";
import { useScaleAnimation } from "../../hooks";
import { makeFontStyleObject } from "../../utils/fonts";
import { WithTestID } from "../../utils/types";
import { Icon, IOIcons } from "../icons";
import { Body } from "../typography";

const spacingDefault = IODimensions.padding.alert.default;

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

// COMPONENT CONFIGURATION

const variantIcons: Record<AlertEdgeToEdgeProps["variant"], IOIcons> = {
  error: "errorFilled",
  warning: "warningFilled",
  info: "infoFilled",
  success: "success"
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
  const alertColors = useIOColors().component.alertEdgeToEdge[variant];

  const renderMainBlock = () => (
    <>
      <View
        style={{
          marginRight: IODimensions.gap.alert.leading,
          alignSelf: "center"
        }}
      >
        <Icon
          color={alertColors.foreground}
          name={variantIcons[variant]}
          size={IODimensions.size.icon.alert}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Body
          accessibilityRole="text"
          color={alertColors.foreground}
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
                color: alertColors.foreground
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
        backgroundColor: alertColors.background
      }}
    >
      {action ? PressableButton() : StaticComponent()}
    </Animated.View>
  );
};

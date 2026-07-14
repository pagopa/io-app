import { RefObject } from "react";
import {
  AccessibilityRole,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  View,
  ViewStyle
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { useIOTheme, useIOThemeContext } from "../../context";
import { IOBannerBigSpacing, IOBannerRadius } from "../../core";
import { hexToRgba, IOColors } from "../../core/IOColors";
import { useScaleAnimation } from "../../hooks";
import { WithTestID } from "../../utils/types";
import { IOButton } from "../buttons";
import { Icon, IOIcons } from "../icons";
import { VSpacer } from "../layout";
import { Body } from "../typography";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    borderRadius: IOBannerRadius,
    borderCurve: "continuous",
    padding: IOBannerBigSpacing
  }
});

/* Component Types */

export type BannerErrorStateProps = BannerErrorStateActionProps &
  BaseBannerErrorStateProps;

type BannerErrorStateActionProps =
  | {
      accessibilityRole?: AccessibilityRole;
      actionText?: never;
      onPress?: never;
    }
  | {
      accessibilityRole?: never;
      actionText?: string;
      onPress: (event: GestureResponderEvent) => void;
    };

type BaseBannerErrorStateProps = WithTestID<{
  accessibilityHint?: string;
  // A11y related props
  accessibilityLabel?: string;
  icon?: IOIcons;
  label: string;
  viewRef?: RefObject<View>;
}>;

export const BannerErrorState = ({
  viewRef,
  icon = "warningFilled",
  label,
  actionText,
  onPress,
  accessibilityHint,
  accessibilityLabel,
  testID
}: BannerErrorStateProps) => {
  const { onPressIn, onPressOut, scaleAnimatedStyle } =
    useScaleAnimation("medium");

  const theme = useIOTheme();
  const { themeType } = useIOThemeContext();

  /* Styles */
  const foregroundColor: IOColors = theme["textBody-tertiary"];
  const backgroundColor: IOColors = "grey-50";

  const dynamicContainerStyles: ViewStyle = {
    backgroundColor:
      themeType === "dark"
        ? hexToRgba(IOColors[backgroundColor], 0.1)
        : IOColors[backgroundColor]
  };

  const renderMainBlock = () => (
    <View
      accessibilityHint={accessibilityHint}
      // A11y related props
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={actionText !== undefined ? "button" : undefined}
      accessible={true}
      style={{ flex: 1, alignItems: "center", gap: 8 }}
    >
      {icon && <Icon color={foregroundColor} name={icon} size={24} />}
      {label && (
        <Body color={foregroundColor} style={{ textAlign: "center" }}>
          {label}
        </Body>
      )}
      {actionText && (
        /* Disable pointer events to avoid
            pressed state on the button */
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
        >
          <VSpacer size={4} />
          <IOButton
            color="primary"
            label={actionText}
            onPress={onPress}
            variant="link"
          />
        </View>
      )}
    </View>
  );

  const PressableContent = () => (
    <Pressable
      accessible={false}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      ref={viewRef}
      testID={testID}
    >
      <Animated.View
        style={[styles.container, dynamicContainerStyles, scaleAnimatedStyle]}
      >
        {renderMainBlock()}
      </Animated.View>
    </Pressable>
  );

  const StaticComponent = () => (
    <View
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={"text"}
      // A11y related props
      accessible={false}
      ref={viewRef}
      style={[styles.container, dynamicContainerStyles]}
      testID={testID}
    >
      {renderMainBlock()}
    </View>
  );

  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(150)}
    >
      {actionText ? <PressableContent /> : <StaticComponent />}
    </Animated.View>
  );
};

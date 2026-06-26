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
import { Icon, IOIcons } from "../icons";
import { VSpacer } from "../layout";
import { Body } from "../typography";
import { IOButton } from "../buttons";

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

type BaseBannerErrorStateProps = WithTestID<{
  icon?: IOIcons;
  label: string;
  viewRef?: RefObject<View>;
  // A11y related props
  accessibilityLabel?: string;
  accessibilityHint?: string;
}>;

type BannerErrorStateActionProps =
  | {
      actionText?: string;
      onPress: (event: GestureResponderEvent) => void;
      accessibilityRole?: never;
    }
  | {
      actionText?: never;
      onPress?: never;
      accessibilityRole?: AccessibilityRole;
    };

export type BannerErrorStateProps = BaseBannerErrorStateProps &
  BannerErrorStateActionProps;

/**
 ** TODO: Move it to the `io-app-design-system` package
 */
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
      style={{ flex: 1, alignItems: "center", gap: 8 }}
      accessible={true}
      // A11y related props
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={actionText !== undefined ? "button" : undefined}
    >
      {icon && <Icon name={icon} size={24} color={foregroundColor} />}
      {label && (
        <Body color={foregroundColor} style={{ textAlign: "center" }}>
          {label}
        </Body>
      )}
      {actionText && (
        /* Disable pointer events to avoid
            pressed state on the button */
        <View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <VSpacer size={4} />
          <IOButton
            variant="link"
            color="primary"
            onPress={onPress}
            label={actionText}
          />
        </View>
      )}
    </View>
  );

  const PressableContent = () => (
    <Pressable
      ref={viewRef}
      testID={testID}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessible={false}
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
      ref={viewRef}
      testID={testID}
      style={[styles.container, dynamicContainerStyles]}
      // A11y related props
      accessible={false}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={"text"}
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

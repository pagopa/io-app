import { JSX, Ref } from "react";
import {
  ColorValue,
  GestureResponderEvent,
  Pressable,
  View,
  ViewStyle
} from "react-native";
import Animated from "react-native-reanimated";

import { useIOThemeContext } from "../../context";
import { IOVisualCostants } from "../../core";
import { hexToRgba, IOColors } from "../../core/IOColors";
import { IOAlertRadius } from "../../core/IOShapes";
import { IOAlertSpacing, IOSpacer } from "../../core/IOSpacing";
import { useScaleAnimation } from "../../hooks";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { Icon, IOIcons, IOIconSizeScale } from "../icons";
import { HStack, VStack } from "../layout";
import { Body, ButtonText } from "../typography";

const ICON_SIZE: IOIconSizeScale = 24;

const [padding, paddingFullWidth] = IOAlertSpacing;

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
  fullWidth?: boolean;
  ref?: Ref<View>;
  variant: "error" | "info" | "success" | "warning";
}>;

type AlertType = AlertActionProps & AlertProps;

type VariantStates = {
  background: ColorValue;
  foreground: IOColors;
  icon: IOIcons;
};

// COMPONENT CONFIGURATION

const mapVariantStatesLightMode: Record<
  NonNullable<AlertType["variant"]>,
  VariantStates
> = {
  error: {
    icon: "errorFilled",
    background: IOColors["error-100"],
    foreground: "error-850"
  },
  warning: {
    icon: "warningFilled",
    background: IOColors["warning-100"],
    foreground: "warning-850"
  },
  info: {
    icon: "infoFilled",
    background: IOColors["info-100"],
    foreground: "info-850"
  },
  success: {
    icon: "success",
    background: IOColors["success-100"],
    foreground: "success-850"
  }
};

const bgOpacityDarkMode = 0.2;

const mapVariantStatesDarkMode: Record<
  NonNullable<AlertType["variant"]>,
  VariantStates
> = {
  error: {
    icon: "errorFilled",
    background: hexToRgba(IOColors["error-400"], bgOpacityDarkMode),
    foreground: "error-100"
  },
  warning: {
    icon: "warningFilled",
    background: hexToRgba(IOColors["warning-400"], bgOpacityDarkMode),
    foreground: "warning-100"
  },
  info: {
    icon: "infoFilled",
    background: hexToRgba(IOColors["info-400"], bgOpacityDarkMode),
    foreground: "info-100"
  },
  success: {
    icon: "success",
    background: hexToRgba(IOColors["success-400"], bgOpacityDarkMode),
    foreground: "success-100"
  }
};

export const Alert = ({
  variant,
  content,
  action,
  onPress,
  fullWidth = false,
  accessibilityHint,
  ref: viewRef,
  testID
}: AlertType): JSX.Element => {
  const { onPressIn, onPressOut, scaleAnimatedStyle } =
    useScaleAnimation("medium");
  const { dynamicFontScale, spacingScaleMultiplier } = useIOFontDynamicScale();
  const { themeType } = useIOThemeContext();

  const paddingDefaultVariant: ViewStyle = {
    padding,
    borderRadius: IOAlertRadius * dynamicFontScale * spacingScaleMultiplier,
    borderCurve: "continuous"
  };

  const mapVariantStates =
    themeType === "light"
      ? mapVariantStatesLightMode
      : mapVariantStatesDarkMode;

  const renderMainBlock = () => (
    <HStack
      allowScaleSpacing
      space={IOVisualCostants.iconMargin as IOSpacer}
      style={{ alignItems: "center" }}
    >
      <Icon
        allowFontScaling
        color={mapVariantStates[variant].foreground}
        name={mapVariantStates[variant].icon}
        size={ICON_SIZE}
      />
      {/* Sadly we don't have specific alignments style for text
      in React Native, like `text-box-trim` for CSS. So we
      have to put these magic numbers after manual adjustments.
      Tested on both Android and iOS. */}
      <View
        style={{
          marginTop: -4 * dynamicFontScale,
          marginBottom: -4 * dynamicFontScale,
          flex: 1
        }}
      >
        <VStack allowScaleSpacing space={8}>
          <Body
            accessibilityRole="text"
            color={mapVariantStates[variant].foreground}
            weight={"Regular"}
          >
            {content}
          </Body>
          {action && (
            <ButtonText
              color={mapVariantStates[variant].foreground}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {action}
            </ButtonText>
          )}
        </VStack>
      </View>
    </HStack>
  );

  const StaticComponent = () => (
    <View
      accessibilityHint={accessibilityHint}
      accessibilityRole="alert"
      accessible={false}
      ref={viewRef}
      style={[
        fullWidth ? { padding: paddingFullWidth } : paddingDefaultVariant,
        { backgroundColor: mapVariantStates[variant].background }
      ]}
      testID={testID}
    >
      {renderMainBlock()}
    </View>
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
      ref={viewRef}
      testID={testID}
    >
      <Animated.View
        style={[
          fullWidth ? { padding: paddingFullWidth } : paddingDefaultVariant,
          { backgroundColor: mapVariantStates[variant].background },
          // Disable pressed animation when component is full width
          !fullWidth && scaleAnimatedStyle
        ]}
      >
        {renderMainBlock()}
      </Animated.View>
    </Pressable>
  );

  return action ? <PressableButton /> : <StaticComponent />;
};

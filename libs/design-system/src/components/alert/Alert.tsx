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
import { IOColors, hexToRgba } from "../../core/IOColors";
import { IOAlertRadius } from "../../core/IOShapes";
import { IOAlertSpacing, IOSpacer } from "../../core/IOSpacing";
import { useScaleAnimation } from "../../hooks";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { IOIconSizeScale, IOIcons, Icon } from "../icons";
import { HStack, VStack } from "../layout";
import { Body, ButtonText } from "../typography";

const ICON_SIZE: IOIconSizeScale = 24;

const [padding, paddingFullWidth] = IOAlertSpacing;

type AlertProps = WithTestID<{
  ref?: Ref<View>;
  variant: "error" | "warning" | "info" | "success";
  content: string;
  fullWidth?: boolean;
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

type AlertType = AlertProps & AlertActionProps;

type VariantStates = {
  icon: IOIcons;
  background: ColorValue;
  foreground: IOColors;
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
      space={IOVisualCostants.iconMargin as IOSpacer}
      allowScaleSpacing
      style={{ alignItems: "center" }}
    >
      <Icon
        allowFontScaling
        name={mapVariantStates[variant].icon}
        size={ICON_SIZE}
        color={mapVariantStates[variant].foreground}
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
        <VStack space={8} allowScaleSpacing>
          <Body
            color={mapVariantStates[variant].foreground}
            weight={"Regular"}
            accessibilityRole="text"
          >
            {content}
          </Body>
          {action && (
            <ButtonText
              color={mapVariantStates[variant].foreground}
              numberOfLines={1}
              ellipsizeMode="tail"
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
      ref={viewRef}
      style={[
        fullWidth ? { padding: paddingFullWidth } : paddingDefaultVariant,
        { backgroundColor: mapVariantStates[variant].background }
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
      onTouchEnd={onPressOut}
      // A11y related props
      accessible={true}
      accessibilityHint={accessibilityHint}
      accessibilityRole={"button"}
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

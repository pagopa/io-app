import { JSX, Ref } from "react";
import {
  GestureResponderEvent,
  Pressable,
  View,
  ViewStyle
} from "react-native";
import Animated from "react-native-reanimated";

import { useIOColors } from "../../context";
import { IODimensions } from "../../core";
import { useScaleAnimation } from "../../hooks";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { Icon, IOIcons } from "../icons";
import { HStack, VStack } from "../layout";
import { Body, ButtonText } from "../typography";

const { default: padding, fullWidth: paddingFullWidth } =
  IODimensions.padding.alert;

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

// COMPONENT CONFIGURATION

const variantIcons: Record<NonNullable<AlertType["variant"]>, IOIcons> = {
  error: "errorFilled",
  warning: "warningFilled",
  info: "infoFilled",
  success: "success"
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
  const colors = useIOColors();
  const alertColors = colors.component.alert[variant];

  const paddingDefaultVariant: ViewStyle = {
    padding,
    borderRadius:
      IODimensions.radius.alert * dynamicFontScale * spacingScaleMultiplier,
    borderCurve: "continuous"
  };

  const renderMainBlock = () => (
    <HStack
      allowScaleSpacing
      space={IODimensions.gap.alert.leading}
      style={{ alignItems: "center" }}
    >
      <Icon
        allowFontScaling
        color={alertColors.foreground.default}
        name={variantIcons[variant]}
        size={IODimensions.size.icon.alert}
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
        <VStack allowScaleSpacing space={IODimensions.gap.alert.action}>
          <Body
            accessibilityRole="text"
            color={alertColors.foreground.default}
            weight={"Regular"}
          >
            {content}
          </Body>
          {action && (
            <ButtonText
              color={alertColors.foreground.default}
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
        { backgroundColor: alertColors.background.default }
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
          { backgroundColor: alertColors.background.default },
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

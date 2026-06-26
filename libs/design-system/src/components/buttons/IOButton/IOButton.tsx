/* eslint-disable complexity */
import { ComponentProps, Ref, useCallback, useEffect, useRef } from "react";
import {
  AccessibilityRole,
  ColorValue,
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleSheet,
  TextProps,
  TextStyle,
  View,
  ViewStyle
} from "react-native";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import Animated, {
  LayoutAnimationConfig,
  useReducedMotion
} from "react-native-reanimated";
import {
  enterTransitionInnerContent,
  enterTransitionInnerContentSmall,
  exitTransitionInnerContent
} from "../../../core";
import { useScaleAnimation } from "../../../hooks";
import { WithTestID } from "../../../utils/types";
import {
  AnimatedIcon,
  AnimatedIconWithColorTransition,
  IOIconSizeScale,
  IOIcons
} from "../../icons";
import { LoadingSpinner } from "../../loadingSpinner";
import { AnimatedIOText } from "../../typography";
import {
  buttonTextFontSize,
  buttonTextLineHeight
} from "../../typography/ButtonText";
import { useButtonAnimatedStyles, useButtonColorMap } from "./styles";

export type IOButtonColor = "primary" | "danger" | "contrast";
export type IOButtonVariant = "solid" | "outline" | "link";

export type IOButtonBlockSpecificProps = Omit<
  ComponentProps<typeof IOButton>,
  "numberOfLines" | "textAlign"
>;

export type IOButtonLinkSpecificProps = Omit<
  ComponentProps<typeof IOButton>,
  "fullWidth" | "loading"
>;

type IOButtonSpecificProps =
  | {
      variant?: "link";
      numberOfLines?: TextProps["numberOfLines"];
      textAlign?: TextStyle["textAlign"];
      fullWidth?: never;
      loading?: never;
    }
  | {
      variant?: "solid" | "outline";
      fullWidth?: boolean;
      loading?: boolean;
      numberOfLines?: never;
      textAlign?: never;
    };

export type IOButtonProps = WithTestID<
  IOButtonSpecificProps & {
    ref?: Ref<View>;
    /**
     * @default primary
     */
    color?: IOButtonColor;
    label: string;
    icon?: IOIcons;
    /**
     * @default false
     */
    fullWidth?: boolean;
    /**
     * @default false
     */
    loading?: boolean;
    /**
     * @default start
     */
    iconPosition?: "start" | "end";
    /**
     * @default 1
     */
    numberOfLines?: number;
    /**
     * @default auto
     */
    textAlign?: TextStyle["textAlign"];
    onPress: (event: GestureResponderEvent) => void;
    /**
     * @default button
     */
    accessibilityRole?: Extract<AccessibilityRole, "button" | "link">;
  } & Pick<
      ComponentProps<typeof Pressable>,
      "disabled" | "accessibilityLabel" | "accessibilityHint"
    >
>;

export const IOButton = ({
  variant = "solid",
  color = "primary",
  label,
  fullWidth = false,
  disabled = false,
  loading = false,
  numberOfLines = 1,
  textAlign = "auto",
  icon,
  iconPosition = "start",
  onPress,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = "button",
  ref,
  testID
}: IOButtonProps) => {
  const mapColorStates = useButtonColorMap(variant);
  const { progress, onPressIn, onPressOut, scaleAnimatedStyle } =
    useScaleAnimation();
  const { buttonAnimatedStyle, labelAnimatedStyle, iconColorAnimatedStyle } =
    useButtonAnimatedStyles(variant, color, progress);
  const reducedMotion = useReducedMotion();

  const isLinkButton = variant === "link";

  // ---------------------------------------
  // VISUAL ATTRIBUTES
  // ---------------------------------------
  const btnIconSizeMap: Record<IOButtonVariant, IOIconSizeScale> = {
    solid: 20,
    outline: 20,
    link: 24
  };

  const btnBorderWidthMap: Record<IOButtonVariant, ViewStyle["borderWidth"]> = {
    solid: 0,
    outline: 2,
    link: 0
  };

  const btnPaddingHorizontalMap: Record<
    string,
    ViewStyle["paddingHorizontal"]
  > = {
    default: 24,
    fullWidth: 16,
    link: 0
  };

  const btnLinkHitSlop: PressableProps["hitSlop"] = {
    top: 14,
    right: 24,
    bottom: 14,
    left: 24
  };

  const btnIconSize = btnIconSizeMap[variant];
  const btnBorderWidth = btnBorderWidthMap[variant];
  const btnBorderRadius = 8;
  const btnSizeDefault = 48;

  const ICON_MARGIN = 8;
  const DISABLED_OPACITY = 0.5;

  // Background color
  const backgroundColor: ColorValue = disabled
    ? mapColorStates[color].background.disabled
    : mapColorStates[color].background.default;

  // Label & Icons colors
  const foregroundColor: ColorValue = disabled
    ? mapColorStates[color]?.foreground?.disabled
    : mapColorStates[color]?.foreground?.default;

  // ---------------------------------------
  // BUTTON INNER LOGIC
  // ---------------------------------------

  /* Prevent the component from triggering the `isEntering' transition
         on the on the first render. Solution from this discussion:
         https://github.com/software-mansion/react-native-reanimated/discussions/2513
      */
  const isMounted = useRef<boolean>(false);

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    isMounted.current = true;
  }, []);

  const handleOnPress = useCallback(
    (event: GestureResponderEvent) => {
      /* Don't call `onPress` if the button is
          in loading state */
      if (loading) {
        return;
      }
      ReactNativeHapticFeedback.trigger("impactLight");
      onPress(event);
    },
    [loading, onPress]
  );

  // ---------------------------------------
  // BUTTON INNER CONTENT
  // ---------------------------------------
  const renderButtonContent = () => (
    <>
      {loading && (
        <LayoutAnimationConfig skipExiting>
          <Animated.View
            style={styles.buttonInner}
            entering={
              isMounted.current ? enterTransitionInnerContentSmall : undefined
            }
            exiting={exitTransitionInnerContent}
          >
            <LoadingSpinner color={foregroundColor} />
          </Animated.View>
        </LayoutAnimationConfig>
      )}

      {!loading && (
        <Animated.View
          style={[
            styles.buttonInner,
            { columnGap: ICON_MARGIN },
            iconPosition === "end" && { flexDirection: "row-reverse" }
          ]}
          entering={isMounted.current ? enterTransitionInnerContent : undefined}
        >
          {icon &&
            (!disabled ? (
              <AnimatedIconWithColorTransition
                allowFontScaling
                name={icon}
                animatedProps={iconColorAnimatedStyle}
                size={btnIconSize}
              />
            ) : (
              <AnimatedIcon
                allowFontScaling
                name={icon}
                color={mapColorStates[color]?.foreground?.disabled}
                size={btnIconSize}
              />
            ))}
          <AnimatedIOText
            weight={"Semibold"}
            size={buttonTextFontSize}
            lineHeight={isLinkButton ? buttonTextLineHeight : undefined}
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            numberOfLines={numberOfLines}
            ellipsizeMode="tail"
            style={[
              { textAlign },
              disabled
                ? { color: mapColorStates[color]?.foreground?.disabled }
                : { color: mapColorStates[color]?.foreground?.default },
              !disabled && labelAnimatedStyle
            ]}
          >
            {label}
          </AnimatedIOText>
        </Animated.View>
      )}
    </>
  );

  return (
    <Pressable
      ref={ref}
      accessible={true}
      // Using || operator because empty string is not an accepted value
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={{
        busy: loading,
        disabled: disabled || false
      }}
      onPress={handleOnPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      hitSlop={isLinkButton ? btnLinkHitSlop : undefined}
      style={
        isLinkButton
          ? { alignSelf: "flex-start" }
          : fullWidth
            ? { flexShrink: 0, alignSelf: "stretch" }
            : { flexShrink: 1, alignSelf: "auto" }
      }
      testID={testID}
    >
      <Animated.View
        style={[
          styles.button,
          /* Prevent Reanimated from overriding background colors
                if button is disabled */
          !disabled && !reducedMotion && scaleAnimatedStyle,
          !disabled && buttonAnimatedStyle,
          {
            paddingHorizontal: isLinkButton
              ? btnPaddingHorizontalMap.link
              : fullWidth
                ? btnPaddingHorizontalMap.fullWidth
                : btnPaddingHorizontalMap.default
          },
          {
            height: isLinkButton ? undefined : btnSizeDefault,
            backgroundColor,
            borderWidth: btnBorderWidth,
            borderRadius: btnBorderRadius,
            borderColor: foregroundColor
          },
          disabled
            ? {
                opacity: DISABLED_OPACITY
              }
            : {}
        ]}
      >
        {renderButtonContent()}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    textAlignVertical: "center", // Prop supported on Android only
    borderCurve: "continuous",
    overflow: "hidden",
    elevation: 0
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  }
});

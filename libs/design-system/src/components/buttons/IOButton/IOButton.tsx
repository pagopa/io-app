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
  View
} from "react-native";
import Animated, {
  LayoutAnimationConfig,
  useReducedMotion
} from "react-native-reanimated";

import { useIOColors } from "../../../context";
import {
  enterTransitionInnerContent,
  enterTransitionInnerContentSmall,
  exitTransitionInnerContent,
  IODimensions,
  IOOpacity,
  IOTypography
} from "../../../core";
import { triggerHaptic } from "../../../functions";
import { useScaleAnimation } from "../../../hooks";
import { WithTestID } from "../../../utils/types";
import {
  AnimatedIcon,
  AnimatedIconWithColorTransition,
  IOIcons,
  IOIconSizeScale
} from "../../icons";
import { LoadingSpinner } from "../../loadingSpinner";
import { AnimatedIOText } from "../../typography";
import { useButtonAnimatedStyles } from "./styles";

export type IOButtonBlockSpecificProps = Omit<
  ComponentProps<typeof IOButton>,
  "numberOfLines" | "textAlign"
>;
export type IOButtonColor = "contrast" | "danger" | "primary";

export type IOButtonLinkSpecificProps = Omit<
  ComponentProps<typeof IOButton>,
  "fullWidth" | "loading"
>;

export type IOButtonProps = WithTestID<
  IOButtonSpecificProps &
    Pick<
      ComponentProps<typeof Pressable>,
      "accessibilityHint" | "accessibilityLabel" | "disabled"
    > & {
      /** @default button */
      accessibilityRole?: Extract<AccessibilityRole, "button" | "link">;
      /** @default primary */
      color?: IOButtonColor;
      /** @default false */
      fullWidth?: boolean;
      icon?: IOIcons;
      /** @default start */
      iconPosition?: "end" | "start";
      label: string;
      /** @default false */
      loading?: boolean;
      /** @default 1 */
      numberOfLines?: number;
      onPress: (event: GestureResponderEvent) => void;
      ref?: Ref<View>;
      /** @default auto */
      textAlign?: TextStyle["textAlign"];
    }
>;

export type IOButtonVariant = "link" | "outline" | "solid";

type IOButtonSpecificProps =
  | {
      fullWidth?: boolean;
      loading?: boolean;
      numberOfLines?: never;
      textAlign?: never;
      variant?: "outline" | "solid";
    }
  | {
      fullWidth?: never;
      loading?: never;
      numberOfLines?: TextProps["numberOfLines"];
      textAlign?: TextStyle["textAlign"];
      variant?: "link";
    };

// ---------------------------------------
// VISUAL ATTRIBUTES
// ---------------------------------------
const btnPadding = IODimensions.padding.button;

const btnIconSizeMap: Record<IOButtonVariant, IOIconSizeScale> = {
  solid: IODimensions.size.icon.button.default,
  outline: IODimensions.size.icon.button.default,
  link: IODimensions.size.icon.button.link
};

const btnBorderWidthMap: Record<IOButtonVariant, number> = {
  solid: 0,
  outline: IODimensions.stroke.button.outline,
  link: 0
};

/* A radius on the link would crop its icon */
const btnBorderRadiusMap: Record<IOButtonVariant, number> = {
  solid: IODimensions.radius.button,
  outline: IODimensions.radius.button,
  link: 0
};

const btnPaddingHorizontalMap: Record<
  IOButtonVariant,
  Record<keyof typeof btnPadding, number>
> = {
  solid: btnPadding,
  outline: btnPadding,
  link: { default: 0, fullWidth: 0 }
};

/* The link has no fixed height: its label sets it */
const btnHeightMap: Record<IOButtonVariant, number | undefined> = {
  solid: IODimensions.height.button,
  outline: IODimensions.height.button,
  link: undefined
};

/* Extends the link label to the minimum touch area */
const btnLinkHitSlopVertical =
  (IODimensions.size.touchTarget - IOTypography.buttonText.lineHeight) / 2;
const btnHitSlopMap: Record<IOButtonVariant, PressableProps["hitSlop"]> = {
  solid: undefined,
  outline: undefined,
  link: {
    top: btnLinkHitSlopVertical,
    right: btnPadding.default,
    bottom: btnLinkHitSlopVertical,
    left: btnPadding.default
  }
};

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
  const colors = useIOColors();
  const buttonColors = colors.component.button[variant][color];
  const { progress, onPressIn, onPressOut, scaleAnimatedStyle } =
    useScaleAnimation();
  const { buttonAnimatedStyle, labelAnimatedStyle, iconColorAnimatedStyle } =
    useButtonAnimatedStyles(variant, buttonColors, progress);
  const reducedMotion = useReducedMotion();

  const isLinkButton = variant === "link";

  // ---------------------------------------
  // VISUAL ATTRIBUTES
  // ---------------------------------------
  const btnWidth = fullWidth ? "fullWidth" : "default";
  const btnIconSize = btnIconSizeMap[variant];
  const btnBorderWidth = btnBorderWidthMap[variant];
  const btnPaddingHorizontal = btnPaddingHorizontalMap[variant][btnWidth];
  const btnBorderRadius = btnBorderRadiusMap[variant];

  const colorState = disabled ? "disabled" : "default";
  const backgroundColor: ColorValue = buttonColors.background[colorState];
  // Label & Icons colors
  const foregroundColor: ColorValue = buttonColors.foreground[colorState];

  // ---------------------------------------
  // BUTTON INNER LOGIC
  // ---------------------------------------

  /* Prevent the component from triggering the `isEntering' transition
         on the on the first render. Solution from this discussion:
         https://github.com/software-mansion/react-native-reanimated/discussions/2513
      */
  const isMounted = useRef<boolean>(false);

  useEffect(() => {
    isMounted.current = true;
  }, []);

  const handleOnPress = useCallback(
    (event: GestureResponderEvent) => {
      /* Don't call `onPress` if the button is
          in loading state */
      if (loading) {
        return;
      }
      triggerHaptic("impactLight");
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
            entering={
              isMounted.current ? enterTransitionInnerContentSmall : undefined
            }
            exiting={exitTransitionInnerContent}
            style={styles.buttonInner}
          >
            <LoadingSpinner color={foregroundColor} />
          </Animated.View>
        </LayoutAnimationConfig>
      )}

      {!loading && (
        <Animated.View
          entering={isMounted.current ? enterTransitionInnerContent : undefined}
          style={[
            styles.buttonInner,
            { columnGap: IODimensions.gap.button.icon },
            iconPosition === "end" && { flexDirection: "row-reverse" }
          ]}
        >
          {icon &&
            (!disabled ? (
              <AnimatedIconWithColorTransition
                allowFontScaling
                animatedProps={iconColorAnimatedStyle}
                name={icon}
                size={btnIconSize}
              />
            ) : (
              <AnimatedIcon
                allowFontScaling
                color={buttonColors.foreground.disabled}
                name={icon}
                size={btnIconSize}
              />
            ))}
          <AnimatedIOText
            accessibilityElementsHidden
            accessible={false}
            ellipsizeMode="tail"
            importantForAccessibility="no-hide-descendants"
            lineHeight={
              isLinkButton ? IOTypography.buttonText.lineHeight : undefined
            }
            numberOfLines={numberOfLines}
            size={IOTypography.buttonText.size}
            style={[
              { textAlign },
              disabled
                ? { color: buttonColors.foreground.disabled }
                : { color: buttonColors.foreground.default },
              !disabled && labelAnimatedStyle
            ]}
            weight={"Semibold"}
          >
            {label}
          </AnimatedIOText>
        </Animated.View>
      )}
    </>
  );

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      // Using || operator because empty string is not an accepted value
      accessibilityLabel={accessibilityLabel || label}
      accessibilityRole={accessibilityRole}
      accessibilityState={{
        busy: loading,
        disabled: disabled || false
      }}
      accessible={true}
      disabled={disabled}
      hitSlop={btnHitSlopMap[variant]}
      onPress={handleOnPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      ref={ref}
      style={
        isLinkButton
          ? styles.pressableLink
          : fullWidth
            ? styles.pressableFullWidth
            : styles.pressableDefault
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
            paddingHorizontal: btnPaddingHorizontal
          },
          {
            height: btnHeightMap[variant],
            backgroundColor,
            borderWidth: btnBorderWidth,
            borderRadius: btnBorderRadius,
            borderColor: foregroundColor
          },
          disabled
            ? {
                opacity: IOOpacity.disabled
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
  pressableDefault: { flexShrink: 1, alignSelf: "auto" },
  pressableFullWidth: { flexShrink: 0, alignSelf: "stretch" },
  pressableLink: { alignSelf: "flex-start" },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    textAlignVertical: "center", // Prop supported on Android only
    borderCurve: "continuous",
    overflow: "hidden"
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  }
});

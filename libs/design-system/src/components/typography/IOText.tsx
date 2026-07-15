import { ComponentProps, ComponentPropsWithRef, useMemo } from "react";
import {
  AccessibilityRole,
  GestureResponderEvent,
  Text,
  TextStyle
} from "react-native";
import Animated from "react-native-reanimated";

import { useIONewTypeface } from "../../context";
import { IOColors } from "../../core";
import { useBoldTextEnabled } from "../../utils/accessibility";
import {
  IOFontFamily,
  IOFontWeight,
  IOMaxFontSizeMultiplier,
  makeFontStyleObject
} from "../../utils/fonts";

export type IOTextProps = IOTextBaseProps & IOTextExcludedProps;

/**
 * We exclude all of the following props when we define a new typographic style
 * in which all of these visual attributes are already defined.
 */
export type IOTextStyle = Omit<
  TextStyle,
  "fontFamily" | "fontSize" | "fontStyle" | "fontWeight" | "lineHeight"
>;

/**
 * Extend `TypographicStyleProps` with extra props for styles that can be used
 * as links
 */
export type TypographicStyleAsLinkProps =
  | {
      accessibilityRole?: Extract<AccessibilityRole, "button" | "link">;
      asLink: true;
      avoidPressable?: true;
      color?: IOColors;
      onPress: (event: GestureResponderEvent) => void;
    }
  | { asLink?: false; avoidPressable?: false; color?: IOColors };

export type TypographicStyleProps = Omit<
  IOTextProps,
  "color" | "font" | "fontStyle" | "lineHeight" | "size" | "style" | "weight"
> & {
  color?: IOTextBaseProps["color"];
} & { style?: IOTextStyle; textStyle?: IOTextStyle };

/**
 * The specific properties needed to calculate the font style using
 * {@link makeFontStyleObject} (these information cannot be included in the
 * default StyleProp<TextStyle>
 */
type IOTextBaseProps = {
  color?: IOColors;
  font?: IOFontFamily;
  fontStyle?: TextStyle["fontStyle"];
  lineHeight?: TextStyle["lineHeight"];
  size?: number;
  style?: IOTextStyle;
  textStyle?: IOTextStyle;
  weight?: IOFontWeight;
};

type IOTextExcludedProps = Omit<ComponentPropsWithRef<typeof Text>, "style">;

/**
 * Decorate the function {@link makeFontStyleObject} with the additional color
 * calculation.
 *
 * @param color A value key from {@link IOColors}, transformed here in
 *   {@link ColorValue}
 * @param args The args of the function {@link makeFontStyleObject}
 */
const calculateTextStyle = (
  color?: IOColors,
  ...args: Parameters<typeof makeFontStyleObject>
) => ({
  ...makeFontStyleObject(...args),
  color: color ? IOColors[color] : undefined
});

/**
 * `IOText` is the core Typography component used to render a text. It accepts
 * all the default text style `StyleProp<TextStyle>` (excluding the ones already
 * applied) in addition with {@link IOTextBaseProps} used to calculate at
 * runtime the platform-dependent styles.
 *
 * @class
 * @param props
 */
export const IOText = ({
  color,
  size,
  font,
  lineHeight,
  weight,
  fontStyle,
  textStyle,
  style,
  children,
  allowFontScaling = true,
  maxFontSizeMultiplier,
  ref,
  ...props
}: IOTextProps) => {
  const boldEnabled = useBoldTextEnabled();
  const { newTypefaceEnabled } = useIONewTypeface();

  const computedFont =
    font || (newTypefaceEnabled ? "Titillio" : "TitilliumSansPro");

  const computedStyleObj = useMemo(
    () =>
      calculateTextStyle(
        color,
        size,
        computedFont,
        lineHeight,
        weight,
        fontStyle,
        boldEnabled
      ),
    [color, size, computedFont, lineHeight, weight, fontStyle, boldEnabled]
  );

  /* In some cases, for example when we use color transitions with
    `reanimated` we need to manage chromatic values as `ColorValue`
    or `string` (not `IOColors`). So we keep a way to override
    the the `color' attribute without giving the ability to
    override all other all other typographic attributes
    through the `style' prop. */
  const fontStyleObj = style?.color
    ? [{ ...computedStyleObj, color: style?.color }]
    : computedStyleObj;

  /* Some typographic styles like `H5` have certain `TextStyle` properties
     like `textTransform` or `letterSpacing` that we want to apply to the text.
     We use the `textStyle` prop to pass these properties to the `IOText`
     component and preserve the ability to define the `style` prop as well.
     The `style` prop is the last one to be applied, so we can properly
     override the `color` attribute.
     */
  const styleObj = style
    ? [textStyle ?? {}, fontStyleObj ?? {}, style]
    : [textStyle ?? {}, fontStyleObj ?? {}];

  /* Accessible typography based on the `fontScale` parameter */
  const accessibleFontSizeProps: ComponentProps<typeof Text> = {
    allowFontScaling,
    maxFontSizeMultiplier: maxFontSizeMultiplier ?? IOMaxFontSizeMultiplier
  };

  return (
    <Text ref={ref} style={styleObj} {...props} {...accessibleFontSizeProps}>
      {children}
    </Text>
  );
};

export const AnimatedIOText = Animated.createAnimatedComponent(IOText);

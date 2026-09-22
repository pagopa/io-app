import { Ref } from "react";
import { Pressable, View } from "react-native";

import { useIOTheme } from "../../context";
import { IOTypographicLinkColorToken, IOTypography } from "../../core";
import { IOFontWeight } from "../../utils/fonts";
import {
  IOText,
  IOTextProps,
  TypographicStyleAsLinkProps,
  TypographicStyleProps
} from "./IOText";

type BodySmallProps = Omit<TypographicStyleProps, "ref"> &
  TypographicStyleAsLinkProps & {
    ref?: Ref<View>;
    weight?: Extract<IOFontWeight, "Regular" | "Semibold">;
  };

const {
  bodySmall: { colorToken, ...bodySmallStyle }
} = IOTypography;

/**
 * `BodySmall` typographic style
 */
export const BodySmall = ({
  ref,
  weight: customWeight,
  color: customColor,
  asLink,
  avoidPressable,
  accessibilityRole = "link",
  textStyle: customTextStyle,
  onPress,
  ...props
}: BodySmallProps) => {
  const theme = useIOTheme();

  const defaultColor = asLink
    ? theme[IOTypographicLinkColorToken]
    : theme[colorToken];

  const BodySmallProps: IOTextProps = {
    ...props,
    ...bodySmallStyle,
    weight: customWeight ?? bodySmallStyle.weight,
    color: customColor ?? defaultColor,
    ...(asLink
      ? {
          accessibilityRole,
          textStyle: customTextStyle ?? { textDecorationLine: "underline" }
        }
      : {})
  };

  if (asLink && !avoidPressable) {
    // TODO: If Pressable is replaced with `onPress` on IOText, ref would
    // always point to a Text node and the Ref<View> override in the prop
    // type can be removed entirely.
    return (
      <Pressable
        accessibilityRole={accessibilityRole}
        onPress={onPress}
        ref={ref}
      >
        <IOText {...BodySmallProps}>{props.children}</IOText>
      </Pressable>
    );
  }

  return (
    <IOText
      {...BodySmallProps}
      onPress={asLink && avoidPressable ? onPress : undefined}
    >
      {props.children}
    </IOText>
  );
};

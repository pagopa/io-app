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

type BodyStyleProps = Omit<TypographicStyleProps, "ref"> &
  TypographicStyleAsLinkProps & {
    ref?: Ref<View>;
    weight?: Extract<IOFontWeight, "Regular" | "Semibold">;
  };

const {
  body: { colorToken, ...bodyStyle }
} = IOTypography;

/** `Body` typographic style */
export const Body = ({
  ref,
  weight: customWeight,
  color: customColor,
  asLink,
  avoidPressable,
  accessibilityRole = "link",
  textStyle: customTextStyle,
  onPress,
  ...props
}: BodyStyleProps) => {
  const theme = useIOTheme();

  const defaultColor = asLink
    ? theme[IOTypographicLinkColorToken]
    : theme[colorToken];

  const BodyProps: IOTextProps = {
    ...props,
    ...bodyStyle,
    weight: customWeight || bodyStyle.weight,
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
        <IOText {...BodyProps}>{props.children}</IOText>
      </Pressable>
    );
  }

  return (
    <IOText
      {...BodyProps}
      onPress={asLink && avoidPressable ? onPress : undefined}
    >
      {props.children}
    </IOText>
  );
};

import { Ref } from "react";
import { Pressable, View } from "react-native";
import { useIOTheme } from "../../context";
import { IOFontWeight } from "../../utils/fonts";
import {
  IOText,
  IOTextProps,
  TypographicStyleAsLinkProps,
  TypographicStyleProps
} from "./IOText";

type BodyStyleProps = Omit<TypographicStyleProps, "ref"> & {
  ref?: Ref<View>;
  weight?: Extract<IOFontWeight, "Regular" | "Semibold">;
} & TypographicStyleAsLinkProps;

export const bodyFontSize = 16;
export const bodyLineHeight = 24;

/**
 * `Body` typographic style
 */
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
    ? theme["interactiveElem-default"]
    : theme["textBody-tertiary"];

  const BodyProps: IOTextProps = {
    ...props,
    dynamicTypeRamp: "body", // iOS only
    weight: customWeight || "Regular",
    size: bodyFontSize,
    lineHeight: bodyLineHeight,
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
        onPress={onPress}
        ref={ref}
        accessibilityRole={accessibilityRole}
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

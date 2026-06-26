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

type BodySmallProps = Omit<TypographicStyleProps, "ref"> & {
  ref?: Ref<View>;
  weight?: Extract<IOFontWeight, "Regular" | "Semibold">;
} & TypographicStyleAsLinkProps;

export const bodySmallFontSize = 14;
export const bodySmallLineHeight = 21;

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
    ? theme["interactiveElem-default"]
    : theme["textBody-tertiary"];

  const BodySmallProps: IOTextProps = {
    ...props,
    dynamicTypeRamp: "footnote" /* iOS only */,
    weight: customWeight ?? "Regular",
    size: bodySmallFontSize,
    lineHeight: bodySmallLineHeight,
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

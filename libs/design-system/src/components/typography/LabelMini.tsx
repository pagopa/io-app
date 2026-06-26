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

type LabelMiniProps = Omit<TypographicStyleProps, "ref"> & {
  ref?: Ref<View>;
  weight?: Extract<IOFontWeight, "Regular" | "Semibold">;
} & TypographicStyleAsLinkProps;

/**
 * `LabelMini` typographic style
 */
export const LabelMini = ({
  ref,
  weight: customWeight,
  color: customColor,
  asLink,
  accessibilityRole = "link",
  textStyle: customTextStyle,
  onPress,
  ...props
}: LabelMiniProps) => {
  const theme = useIOTheme();

  const defaultColor = asLink
    ? theme["interactiveElem-default"]
    : theme["textBody-tertiary"];

  const LabelMiniProps: IOTextProps = {
    ...props,
    dynamicTypeRamp: "footnote" /* iOS only */,
    weight: customWeight || "Semibold",
    size: 12,
    lineHeight: 18,
    color: customColor ?? defaultColor,
    ...(asLink
      ? {
          accessibilityRole,
          textStyle: customTextStyle ?? { textDecorationLine: "underline" }
        }
      : {})
  };

  if (asLink) {
    // TODO: If Pressable is replaced with `onPress` on IOText, ref would
    // always point to a Text node and the Ref<View> override in the prop
    // type can be removed entirely.
    return (
      <Pressable
        onPress={onPress}
        ref={ref}
        accessibilityRole={accessibilityRole}
      >
        <IOText {...LabelMiniProps}>{props.children}</IOText>
      </Pressable>
    );
  }

  return <IOText {...LabelMiniProps}>{props.children}</IOText>;
};

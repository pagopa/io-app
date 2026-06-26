import { PropsWithChildren } from "react";
import { View, ViewProps, ViewStyle } from "react-native";
import { IOSpacer } from "../../core";
import { useIOFontDynamicScale } from "../../utils/accessibility";

type AllowedStyleProps = Exclude<
  ViewStyle,
  "display" | "flexDirection" | "gap"
>;

type A11YRelatedProps = Pick<
  ViewProps,
  "pointerEvents" | "accessibilityElementsHidden" | "importantForAccessibility"
>;

type Stack = PropsWithChildren<{
  space?: IOSpacer | 0;
  style?: AllowedStyleProps;
  allowScaleSpacing?: boolean;
}> &
  A11YRelatedProps;

type BaseStack = Stack & {
  orientation: "vertical" | "horizontal";
};

/**
Horizontal Stack component
@param {IOSpacer} space
 */

const Stack = ({
  space = 0,
  style,
  orientation = "vertical",
  allowScaleSpacing,
  children,
  ...props
}: BaseStack) => {
  const { dynamicFontScale, spacingScaleMultiplier } = useIOFontDynamicScale();

  return (
    <View
      {...props}
      style={{
        display: "flex",
        flexDirection: orientation === "horizontal" ? "row" : "column",
        gap:
          allowScaleSpacing && space !== 0
            ? space * dynamicFontScale * spacingScaleMultiplier
            : space,
        ...style
      }}
    >
      {children}
    </View>
  );
};

export const HStack = ({ children, ...props }: Stack) => (
  <Stack orientation="horizontal" {...props}>
    {children}
  </Stack>
);

/**
Vertical Stack component
@param {IOSpacer} space
 */

export const VStack = ({ children, ...props }: Stack) => (
  <Stack orientation="vertical" {...props}>
    {children}
  </Stack>
);

import { PropsWithChildren } from "react";
import { View, ViewProps, ViewStyle } from "react-native";

import { IOSpacer } from "../../core";
import { useIOFontDynamicScale } from "../../utils/accessibility";

type A11YRelatedProps = Pick<
  ViewProps,
  "accessibilityElementsHidden" | "importantForAccessibility" | "pointerEvents"
>;

type AllowedStyleProps = Exclude<
  ViewStyle,
  "display" | "flexDirection" | "gap"
>;

type BaseStack = Stack & {
  orientation: "horizontal" | "vertical";
};

type Stack = A11YRelatedProps &
  PropsWithChildren<{
    allowScaleSpacing?: boolean;
    space?: 0 | IOSpacer;
    style?: AllowedStyleProps;
  }>;

/**
 * Horizontal Stack component
 *
 * @param {IOSpacer} space
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
 * Vertical Stack component
 *
 * @param {IOSpacer} space
 */

export const VStack = ({ children, ...props }: Stack) => (
  <Stack orientation="vertical" {...props}>
    {children}
  </Stack>
);

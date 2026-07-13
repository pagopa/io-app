import { ColorValue, StyleProp, ViewProps } from "react-native";

export type SVGIconProps = {
  size: number | "100%";
  style?: StyleProp<any>;
  color: ColorValue;
  accessible: boolean;
  accessibilityElementsHidden: boolean;
  accessibilityLabel: string;
  importantForAccessibility: ViewProps["importantForAccessibility"];
  pointerEvents?: ViewProps["pointerEvents"];
};

import { ColorValue, StyleProp, ViewProps } from "react-native";

export type SVGIconProps = {
  accessibilityElementsHidden: boolean;
  accessibilityLabel: string;
  accessible: boolean;
  color: ColorValue;
  importantForAccessibility: ViewProps["importantForAccessibility"];
  pointerEvents?: ViewProps["pointerEvents"];
  size: "100%" | number;
  style?: StyleProp<any>;
};

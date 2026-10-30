import { RoundedRect } from "@shopify/react-native-skia";
import { ColorSchemeName, LayoutRectangle } from "react-native";
import { SharedValue } from "react-native-reanimated";

import { ItwBrandedSkiaGradient } from "./ItwBrandedSkiaGradient";

export type ItwIridescentBorderVariant = "default" | "error" | "warning";

type ItwIridescentBorderProps = {
  borderRadius?: number;
  height: LayoutRectangle["height"];
  /** Relative device roll; the border stays at rest when omitted. */
  roll?: SharedValue<number>;
  themeType?: ColorSchemeName;
  thickness?: number;
  variant?: ItwIridescentBorderVariant;
  width: LayoutRectangle["width"];
};

const DARK_MODE_BORDER_OPACITY = 0.64;

/**
 * WARNING: this component must be placed inside a {@link Canvas} component.
 *
 * Renders the IT-Wallet branded gradient border, animated by the device roll.
 */
export const ItwBrandedSkiaBorder = ({
  width,
  height,
  thickness = 3,
  borderRadius = 16,
  variant = "default",
  themeType = "light",
  roll
}: ItwIridescentBorderProps) => (
  <RoundedRect
    height={height}
    opacity={themeType === "light" ? 1 : DARK_MODE_BORDER_OPACITY}
    r={borderRadius}
    strokeJoin={"round"}
    strokeWidth={thickness}
    style={"stroke"}
    width={width}
    x={0}
    y={0}
  >
    <ItwBrandedSkiaGradient
      height={height}
      roll={roll}
      variant={variant}
      width={width}
    />
  </RoundedRect>
);

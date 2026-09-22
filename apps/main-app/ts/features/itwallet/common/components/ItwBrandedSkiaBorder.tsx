import {
  ColorMatrix,
  Mask,
  OpacityMatrix,
  Paint,
  RoundedRect,
  Group as SkiaGroup
} from "@shopify/react-native-skia";
import { ColorSchemeName, LayoutRectangle } from "react-native";

import { ItwBrandedSkiaGradient } from "./ItwBrandedSkiaGradient";

export type ItwIridescentBorderVariant = "default" | "error" | "warning";

type ItwIridescentBorderProps = {
  borderRadius?: number;
  height: LayoutRectangle["height"];
  themeType?: ColorSchemeName;
  thickness?: number;
  variant?: ItwIridescentBorderVariant;
  width: LayoutRectangle["width"];
};

/**
 * WARNING: this component must be placed inside a {@link Canvas} component.
 *
 * Renders an animated IT-Wallet branded gradient using Skia and device rotation sensor data.
 */
export const ItwBrandedSkiaBorder = ({
  width,
  height,
  thickness = 3,
  borderRadius = 16,
  variant = "default",
  themeType = "light"
}: ItwIridescentBorderProps) => {
  const isLightMode = themeType === "light";

  /* Styles */
  const gradientTickOpacity = isLightMode ? 1 : 0.8;
  const gradientBorderOpacity = isLightMode ? 1.0 : 0.8;

  return (
    <Mask
      mask={
        <SkiaGroup blendMode={"colorDodge"} opacity={gradientBorderOpacity}>
          <ItwBrandedSkiaGradient
            height={height}
            variant={variant}
            width={width}
          />
        </SkiaGroup>
      }
      mode="alpha"
    >
      <SkiaGroup
        layer={
          <Paint>
            <ColorMatrix matrix={OpacityMatrix(gradientTickOpacity)} />
          </Paint>
        }
      >
        <RoundedRect
          height={height}
          r={borderRadius}
          strokeJoin={"round"}
          strokeWidth={thickness}
          style={"stroke"}
          width={width}
          x={0}
          y={0}
        />
      </SkiaGroup>
    </Mask>
  );
};

import { useIOThemeContext } from "@pagopa/io-app-design-system";
import {
  Canvas,
  ColorMatrix,
  Mask,
  OpacityMatrix,
  Paint,
  RoundedRect,
  Group as SkiaGroup
} from "@shopify/react-native-skia";
import { LayoutRectangle } from "react-native";
import { ItwBrandedSkiaGradient } from "./ItwBrandedSkiaGradient";

export type ItwIridescentBorderVariant = "default" | "warning" | "error";

type ItwIridescentBorderProps = {
  width: LayoutRectangle["width"];
  height: LayoutRectangle["height"];
  variant?: ItwIridescentBorderVariant;
  thickness?: number;
  cornerRadius?: number;
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
  cornerRadius = 16,
  variant = "default"
}: ItwIridescentBorderProps) => {
  const { themeType } = useIOThemeContext();
  const isLightMode = themeType === "light";

  /* Styles */
  const gradientTickOpacity = isLightMode ? 1 : 0.8;
  const gradientBorderOpacity = isLightMode ? 1.0 : 0.5;

  return (
    <Mask
      mode="alpha"
      mask={
        <SkiaGroup blendMode={"colorDodge"} opacity={gradientBorderOpacity}>
          <ItwBrandedSkiaGradient
            width={width}
            height={height}
            variant={variant}
          />
        </SkiaGroup>
      }
    >
      <SkiaGroup
        layer={
          <Paint>
            <ColorMatrix matrix={OpacityMatrix(gradientTickOpacity)} />
          </Paint>
        }
      >
        <RoundedRect
          x={0}
          y={0}
          width={width}
          height={height}
          r={cornerRadius}
          strokeWidth={thickness}
          strokeJoin={"round"}
          style={"stroke"}
        />
      </SkiaGroup>
    </Mask>
  );
};

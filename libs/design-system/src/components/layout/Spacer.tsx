import { useMemo } from "react";
import { View } from "react-native";

import { hexToRgba, IOColorsLegacy, IOSpace } from "../../core";
import { useIOFontDynamicScale } from "../../utils/accessibility";

type BaseSpacerProps = {
  allowScaleSpacing?: boolean;
  orientation: "horizontal" | "vertical";
  size: IOSpace;
};

type SpacerProps = {
  allowScaleSpacing?: boolean;
  size?: IOSpace;
};

const DEFAULT_SIZE: IOSpace = 16;

/* Debug Mode */
const debugMode = false;
const debugBg = hexToRgba(IOColorsLegacy["error-600"], 0.2);

/**
 * Native `Spacer` component
 *
 * @param {string} orientation
 * @param {IOSpace} size
 */
const Spacer = ({ allowScaleSpacing, orientation, size }: BaseSpacerProps) => {
  const { dynamicFontScale, spacingScaleMultiplier } = useIOFontDynamicScale();

  const style = useMemo(
    () => ({
      ...(orientation === "vertical" && {
        height: allowScaleSpacing
          ? size * dynamicFontScale * spacingScaleMultiplier
          : size
      }),
      ...(orientation === "horizontal" && {
        width: allowScaleSpacing
          ? size * dynamicFontScale * spacingScaleMultiplier
          : size
      }),
      ...((debugMode as boolean) && {
        backgroundColor: debugBg
      })
    }),
    [
      allowScaleSpacing,
      dynamicFontScale,
      orientation,
      size,
      spacingScaleMultiplier
    ]
  );

  return <View style={style} />;
};

/**
 * Horizontal spacer component
 *
 * @param {IOSpace} size
 */
export const HSpacer = ({ size = DEFAULT_SIZE }: SpacerProps) => (
  <Spacer orientation={"horizontal"} size={size} />
);
/**
 * Vertical spacer component
 *
 * @param {IOSpace} size
 */
export const VSpacer = ({ size = DEFAULT_SIZE }: SpacerProps) => (
  <Spacer orientation={"vertical"} size={size} />
);

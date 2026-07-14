import { useMemo } from "react";
import { View } from "react-native";
import { hexToRgba, IOColors, IOSpacer } from "../../core";
import { useIOFontDynamicScale } from "../../utils/accessibility";

type BaseSpacerProps = {
  orientation: "vertical" | "horizontal";
  size: IOSpacer;
  allowScaleSpacing?: boolean;
};

type SpacerProps = {
  size?: IOSpacer;
  allowScaleSpacing?: boolean;
};

const DEFAULT_SIZE: IOSpacer = 16;

/* Debug Mode */
const debugMode = false;
const debugBg = hexToRgba(IOColors["error-600"], 0.2);

/**
Native `Spacer` component
@param  {string} orientation
@param {IOSpacer} size
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
Horizontal spacer component
@param {IOSpacer} size
 */
export const HSpacer = ({ size = DEFAULT_SIZE }: SpacerProps) => (
  <Spacer orientation={"horizontal"} size={size} />
);
/**
Vertical spacer component
@param {IOSpacer} size
 */
export const VSpacer = ({ size = DEFAULT_SIZE }: SpacerProps) => (
  <Spacer orientation={"vertical"} size={size} />
);

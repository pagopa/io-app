import React from "react";
import { View } from "react-native";
import { hexToRgba, IOColors } from "../variables/IOColors";
import type { IOSpacer } from "../variables/IOSpacing";

export type SpacerOrientation = "vertical" | "horizontal";

type BaseSpacerProps = {
  orientation: SpacerOrientation;
  size: IOSpacer;
};

type SpacerProps = {
  size?: IOSpacer;
};

const DEFAULT_SIZE = 16;

/* Debug Mode */
const debugMode = false;
const debugBg = hexToRgba(IOColors.red, 0.2);

/**
Native `Spacer` component
@param  {SpacerOrientation} orientation 
@param {IOSpacer} size
 */
const Spacer = ({ orientation, size }: BaseSpacerProps) => (
  <View
    style={{
      ...(orientation === "vertical" && {
        height: size
      }),
      ...(orientation === "horizontal" && {
        width: size
      }),
      ...((debugMode as boolean) && {
        backgroundColor: debugBg
      })
    }}
  />
);

/**
Horizontal spacer component
@param {IOSpacer} size
 */
export const HSpacer = ({ size = DEFAULT_SIZE }: SpacerProps) => (
  <Spacer orientation="horizontal" size={size} />
);
/**
Vertical spacer component
@param {IOSpacer} size
 */
export const VSpacer = ({ size = DEFAULT_SIZE }: SpacerProps) => (
  <Spacer orientation="vertical" size={size} />
);

import React from "react";
import { View } from "react-native";
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
/**
Native `Spacer` component that replaces the legacy one, managed through NativeBase
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

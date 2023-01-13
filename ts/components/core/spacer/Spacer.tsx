import React from "react";
import { View } from "react-native";
import type { IOSpacer } from "../variables/IOSpacing";

export type SpacerOrientation = "vertical" | "horizontal";

type SpacerProps = {
  orientation?: SpacerOrientation;
  size?: IOSpacer;
};

/**
Native `Spacer` component that replaces the legacy one, managed through NativeBase.

@param  {SpacerOrientation} orientation 
@param {IOSpacerType} size
 */
export const Spacer = ({
  orientation = "vertical",
  size = 16
}: SpacerProps) => (
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

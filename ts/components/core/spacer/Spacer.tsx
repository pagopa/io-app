import React from "react";
import { View } from "react-native";
import { IOSpacer, IOSpacerType } from "../variables/IOSpacing";

type SpacerOrientation = "vertical" | "horizontal";

type SpacerProps = {
  orientation?: SpacerOrientation;
  size?: IOSpacerType;
};

/* Add documentation to improve DX */
export const Spacer = ({
  orientation = "vertical",
  size = "md"
}: SpacerProps) => (
  <View
    style={{
      ...(orientation === "vertical" && {
        height: IOSpacer[size]
      }),
      ...(orientation === "horizontal" && {
        width: IOSpacer[size]
      })
    }}
  />
);

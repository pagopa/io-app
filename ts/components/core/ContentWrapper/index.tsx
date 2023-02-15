import React from "react";
import { View } from "react-native";
import type { IOContentWrapper } from "../variables/IOSpacing";

type IOContentWrapperProps = {
  margin?: IOContentWrapper;
  children: React.ReactNode;
};

const DEFAULT_APP_MARGIN = 24;

/**
`ContentWrapper` is the main wrapper of the application. It automatically sets side margins,
depending on the size value
@param {IOContentWrapper} margin
 */
export const ContentWrapper = ({
  margin = DEFAULT_APP_MARGIN,
  children
}: IOContentWrapperProps) => (
  <View
    style={{
      paddingHorizontal: margin
    }}
  >
    {children}
  </View>
);

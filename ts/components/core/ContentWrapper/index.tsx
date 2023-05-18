import React from "react";
import { View } from "react-native";
import type { IOAppMargin } from "../variables/IOSpacing";
import { IOLayoutCostants } from "../variables/IOStyles";

type IOContentWrapperProps = {
  margin?: IOAppMargin;
  children: React.ReactNode;
};

/**
`ContentWrapper` is the main wrapper of the application. It automatically sets side margins,
depending on the size value
@param {IOContentWrapper} margin
 */
export const ContentWrapper = ({
  margin = IOLayoutCostants.appMarginDefault,
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

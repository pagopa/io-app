import { ReactNode, Ref } from "react";
import { View, ViewProps, ViewStyle } from "react-native";

import type { IOAppMargin } from "../../core";

import { IOVisualCostants } from "../../core/IOStyles";
import { WithTestID } from "../../utils/types";

type IOContentWrapperProps = WithTestID<
  Omit<ViewProps, "style"> & {
    children: ReactNode;
    margin?: IOAppMargin;
    ref?: Ref<View>;
    style?: Omit<
      ViewStyle,
      "paddingHorizontal" | "paddingLeft" | "paddingRight"
    >;
  }
>;

/**
`ContentWrapper` is the main wrapper of the application. It automatically sets side margins,
depending on the size value
@param {IOContentWrapper} margin
 */
export const ContentWrapper = ({
  margin = IOVisualCostants.appMarginDefault,
  style,
  children,
  testID,
  ref,
  ...rest
}: IOContentWrapperProps) => (
  <View
    ref={ref}
    style={{
      paddingHorizontal: margin,
      ...style
    }}
    testID={testID}
    {...rest}
  >
    {children}
  </View>
);

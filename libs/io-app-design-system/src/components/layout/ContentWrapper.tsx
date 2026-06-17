import { Ref, ReactNode } from "react";
import { View, ViewProps, ViewStyle } from "react-native";
import { WithTestID } from "src/utils/types";
import type { IOAppMargin } from "../../core";
import { IOVisualCostants } from "../../core/IOStyles";

type IOContentWrapperProps = WithTestID<
  Omit<ViewProps, "style"> & {
    ref?: Ref<View>;
    margin?: IOAppMargin;
    children: ReactNode;
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
    testID={testID}
    style={{
      paddingHorizontal: margin,
      ...style
    }}
    ref={ref}
    {...rest}
  >
    {children}
  </View>
);

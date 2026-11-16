import { ReactNode, Ref } from "react";
import { View, ViewProps, ViewStyle } from "react-native";

import type { IOScreenPadding } from "../../core";

import { IODimensions } from "../../core/tokens";
import { WithTestID } from "../../utils/types";

type IOContentWrapperProps = WithTestID<
  Omit<ViewProps, "style"> & {
    children: ReactNode;
    margin?: IOScreenPadding;
    ref?: Ref<View>;
    style?: Omit<
      ViewStyle,
      "paddingHorizontal" | "paddingLeft" | "paddingRight"
    >;
  }
>;

/**
 * `ContentWrapper` is the main wrapper of the application. It automatically
 * sets side margins, depending on the size value
 *
 * @param {IOContentWrapper} margin
 */
export const ContentWrapper = ({
  margin = IODimensions.padding.screen.default,
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

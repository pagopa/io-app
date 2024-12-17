import {
  IOColors,
  IOVisualCostants,
  ListItemHeader
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import { withDebugEnabled } from "./withDebugEnabled";

export type DebugViewProps = {
  title?: string;
  ignoreHorizontalMargins?: boolean;
};

/**
 * This component renders its content only if the debug mode is enabled, otherwise return null (nothing)
 */
export const DebugView = withDebugEnabled(
  ({
    children,
    title = "Debug",
    ignoreHorizontalMargins = false
  }: React.PropsWithChildren<DebugViewProps>) => (
    <View
      testID="DebugViewTestID"
      style={{
        paddingHorizontal: 24,
        paddingBottom: 12,
        backgroundColor: IOColors["grey-100"],
        marginHorizontal: ignoreHorizontalMargins
          ? -IOVisualCostants.appMarginDefault
          : 0
      }}
    >
      <ListItemHeader label={title} iconName="ladybug" />
      {children}
    </View>
  )
);

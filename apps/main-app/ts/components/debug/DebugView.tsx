import {
  IOColors,
  IOVisualCostants,
  ListItemHeader
} from "@pagopa/io-app-design-system";

import { PropsWithChildren } from "react";
import { View } from "react-native";
import { useDebugEnabled } from "./withDebugEnabled";

export type DebugViewProps = {
  title?: string;
  ignoreHorizontalMargins?: boolean;
};

/**
 * This component renders its content only if the debug mode is enabled, otherwise return null (nothing)
 */
export const DebugView = ({
  children,
  title = "Debug",
  ignoreHorizontalMargins = false
}: PropsWithChildren<DebugViewProps>) => {
  const isDebug = useDebugEnabled();
  if (!isDebug) {
    return null;
  }
  return (
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
  );
};

import {
  IOColors,
  IOVisualCostants,
  ListItemHeader
} from "@io-app/design-system";
import { PropsWithChildren } from "react";
import { View } from "react-native";

import { WithDebugEnabled } from "./withDebugEnabled";

export type DebugViewProps = {
  ignoreHorizontalMargins?: boolean;
  title?: string;
};

/**
 * This component renders its content only if the debug mode is enabled, otherwise return null (nothing)
 */
export const DebugView = ({
  children,
  title = "Debug",
  ignoreHorizontalMargins = false
}: PropsWithChildren<DebugViewProps>) => (
  <WithDebugEnabled>
    <View
      style={{
        paddingHorizontal: 24,
        paddingBottom: 12,
        backgroundColor: IOColors["grey-100"],
        marginHorizontal: ignoreHorizontalMargins
          ? -IOVisualCostants.appMarginDefault
          : 0
      }}
      testID="DebugViewTestID"
    >
      <ListItemHeader iconName="ladybug" label={title} />
      {children}
    </View>
  </WithDebugEnabled>
);

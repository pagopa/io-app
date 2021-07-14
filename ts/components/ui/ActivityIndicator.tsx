import * as React from "react";
import {
  ActivityIndicator as RNActivityIndicator,
  ActivityIndicatorProps
} from "react-native";

import variables from "../../theme/variables";
import { WithTestID } from "../../types/WithTestID";

type Props = WithTestID<{
  color?: string;
  accessibilityLabel?: string;
  size?: ActivityIndicatorProps["size"];
}>;

const ActivityIndicator = (props: Props) => (
  <RNActivityIndicator
    size={props.size ?? "large"}
    accessibilityLabel={props.accessibilityLabel}
    color={props.color || variables.brandPrimary}
    testID={props.testID ?? "rn-activity-indicator"}
  />
);

export default ActivityIndicator;

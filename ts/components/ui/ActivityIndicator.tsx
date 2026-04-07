import {
  ActivityIndicatorProps,
  ActivityIndicator as RNActivityIndicator
} from "react-native";

import variables from "../../theme/variables";

const ActivityIndicator = (props: ActivityIndicatorProps) => (
  <RNActivityIndicator
    accessibilityLabel={props.accessibilityLabel}
    color={props.color || variables.brandPrimary}
    size={props.size ?? "large"}
    testID={props.testID ?? "rn-activity-indicator"}
  />
);

export default ActivityIndicator;

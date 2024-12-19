import {
  ActivityIndicator as RNActivityIndicator,
  ActivityIndicatorProps
} from "react-native";

import variables from "../../theme/variables";

const ActivityIndicator = (props: ActivityIndicatorProps) => (
  <RNActivityIndicator
    size={props.size ?? "large"}
    accessibilityLabel={props.accessibilityLabel}
    color={props.color || variables.brandPrimary}
    testID={props.testID ?? "rn-activity-indicator"}
  />
);

export default ActivityIndicator;

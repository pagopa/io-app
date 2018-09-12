import * as React from "react";
import { ActivityIndicator as RNActivityIndicator } from "react-native";

import variables from "../../theme/variables";

interface Props {
  color?: string;
}

const ActivityIndicator: React.SFC<Props> = ({ color }) => (
  <RNActivityIndicator size="large" color={color || variables.brandPrimary} />
);

export default ActivityIndicator;

import * as React from "react";
import { ActivityIndicator as RNActivityIndicator } from "react-native";

import variables from "../../theme/variables";

interface Props {
  color?: string;
}

const ActivityIndicator: React.SFC<Props> = ({ color }) => (
  <RNActivityIndicator size="large" color={color} />
);

// tslint:disable-next-line no-object-mutation
ActivityIndicator.defaultProps = {
  color: variables.brandPrimary
};

export default ActivityIndicator;

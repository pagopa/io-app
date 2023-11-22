import { BodyMonospace, IOColors } from "@pagopa/io-app-design-system";
import React from "react";
import { View } from "react-native";

type Props = {
  data?: any;
};

/**
 * This simple component allows to print the content of an object in an elegant and readable way.
 */
export const DebugPrettyPrint = (props: Props) => (
  <View
    style={{
      backgroundColor: IOColors["grey-50"],
      padding: 8
    }}
  >
    <BodyMonospace>{JSON.stringify(props.data, null, 2)}</BodyMonospace>
  </View>
);

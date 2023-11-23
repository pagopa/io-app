import { IOColors, useTypographyFactory } from "@pagopa/io-app-design-system";
import React from "react";
import { View } from "react-native";

type Props = {
  data?: any;
};

const CustomBodyMonospace = (props: { children?: React.ReactNode }) =>
  useTypographyFactory({
    ...props,
    defaultWeight: "Medium",
    defaultColor: "bluegrey",
    font: "DMMono",
    fontStyle: { fontSize: 12, lineHeight: 18 }
  });

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
    <CustomBodyMonospace>
      {JSON.stringify(props.data, null, 2)}
    </CustomBodyMonospace>
  </View>
);

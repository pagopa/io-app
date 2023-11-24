import {
  IOColors,
  LabelSmall,
  useTypographyFactory
} from "@pagopa/io-app-design-system";
import React from "react";
import { View } from "react-native";

type Props = {
  title?: string;
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
  <>
    {props.title && (
      <View
        style={{
          backgroundColor: IOColors["grey-700"],
          padding: 8
        }}
      >
        <LabelSmall weight="Bold" color="white">
          {props.title}
        </LabelSmall>
      </View>
    )}
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
  </>
);

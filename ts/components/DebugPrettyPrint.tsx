/* 
WARNING: This component is not referenced anywhere, but is used
for development purposes. for development purposes. Don't REMOVE it!
*/
import {
  IOColors,
  Icon,
  LabelSmall,
  useTypographyFactory
} from "@pagopa/io-app-design-system";
import React from "react";
import { Pressable, View } from "react-native";

type Props = {
  title?: string;
  data?: any;
  startCollapsed?: boolean;
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
export const DebugPrettyPrint = ({
  title,
  data,
  startCollapsed = false
}: Props) => {
  const [expanded, setExpanded] = React.useState(!startCollapsed);

  return (
    <>
      {title && (
        <Pressable
          accessibilityRole="button"
          style={{
            backgroundColor: IOColors["grey-700"],
            padding: 8,
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between"
          }}
          onPress={() => setExpanded(_ => !_)}
        >
          <LabelSmall weight="Bold" color="white">
            {title}
          </LabelSmall>
          <Icon
            name={expanded ? "chevronTop" : "chevronBottom"}
            color="white"
          />
        </Pressable>
      )}
      {expanded && (
        <View
          style={{
            backgroundColor: IOColors["grey-50"],
            padding: 8
          }}
        >
          <CustomBodyMonospace>
            {JSON.stringify(data, null, 2)}
          </CustomBodyMonospace>
        </View>
      )}
    </>
  );
};

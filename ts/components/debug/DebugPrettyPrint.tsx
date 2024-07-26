/*
WARNING: This component is not referenced anywhere, but is used
for development purposes. for development purposes. Don't REMOVE it!
*/
import {
  IOColors,
  IconButton,
  LabelSmall,
  useTypographyFactory
} from "@pagopa/io-app-design-system";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Prettify } from "../../types/helpers";
import { clipboardSetStringWithFeedback } from "../../utils/clipboard";
import { withDebugEnabled } from "./withDebugEnabled";

type ExpandableProps =
  | {
      expandable: true;
      isExpanded?: boolean;
    }
  | {
      expandable?: false;
      isExpanded?: undefined;
    };

type Props = Prettify<
  {
    title: string;
    data: any;
  } & ExpandableProps
>;

/**
 * This component allows to print the content of an object in an elegant and readable way.
 * and to copy its content to the clipboard by pressing on the title.
 * The component it is rendered only if debug mode is enabled
 */
export const DebugPrettyPrint = withDebugEnabled(
  ({ title, data, expandable = true, isExpanded = false }: Props) => {
    const [expanded, setExpanded] = React.useState(isExpanded);
    const prettyData = React.useMemo(
      () => JSON.stringify(data, null, 2),
      [data]
    );

    const content = React.useMemo(() => {
      if ((expandable && !expanded) || !expandable) {
        return null;
      }
      return (
        <View style={styles.content}>
          <CustomBodyMonospace>{prettyData}</CustomBodyMonospace>
        </View>
      );
    }, [prettyData, expandable, expanded]);

    return (
      <View testID="DebugPrettyPrintTestID" style={styles.container}>
        <Pressable
          accessibilityRole="button"
          style={styles.header}
          onPress={() => clipboardSetStringWithFeedback(prettyData)}
        >
          <LabelSmall weight="Bold" color="white">
            {title}
          </LabelSmall>
          {expandable ? (
            <IconButton
              icon={expanded ? "chevronTop" : "chevronBottom"}
              accessibilityLabel="expand"
              onPress={() => setExpanded(_ => !_)}
              color="contrast"
            />
          ) : null}
        </Pressable>
        {content}
      </View>
    );
  }
);

const CustomBodyMonospace = (props: { children?: React.ReactNode }) =>
  useTypographyFactory({
    ...props,
    defaultWeight: "Medium",
    defaultColor: "bluegrey",
    font: "DMMono",
    fontStyle: { fontSize: 12, lineHeight: 18 }
  });

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    overflow: "hidden",
    marginVertical: 4
  },
  header: {
    backgroundColor: IOColors["error-600"],
    padding: 12,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  content: {
    backgroundColor: IOColors["grey-50"],
    padding: 8
  }
});

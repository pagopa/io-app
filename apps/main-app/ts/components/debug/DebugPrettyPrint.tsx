/*
WARNING: This component is not referenced anywhere, but is used
for development purposes. Please, Don't REMOVE it, thank you!
*/
import {
  BodySmall,
  HStack,
  IconButton,
  IOColors,
  IOText,
  useIOToast
} from "@pagopa/io-app-design-system";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import RNFS from "react-native-fs";
import Share from "react-native-share";

import { Prettify } from "../../types/helpers";
import { clipboardSetStringWithFeedback } from "../../utils/clipboard";
import { debugInfoReplacer } from "./utils";
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
  ExpandableProps & {
    data: any;
    title: string;
  }
>;

/**
 * This component allows to print the content of an object in an elegant and readable way.
 * and to copy its content to the clipboard by pressing on the title.
 * The component it is rendered only if debug mode is enabled
 */
export const DebugPrettyPrint = withDebugEnabled(
  ({ title, data, expandable = true, isExpanded = false }: Props) => {
    const toast = useIOToast();
    const [expanded, setExpanded] = useState(isExpanded);

    const content = useMemo(() => {
      if ((expandable && !expanded) || !expandable) {
        return null;
      }

      return (
        <View pointerEvents="box-only" style={styles.content}>
          <IOText
            color={"grey-700"}
            font="FiraCode"
            lineHeight={18}
            size={12}
            weight="Medium"
          >
            {JSON.stringify(
              data,
              debugInfoReplacer({ truncateStrings: true }),
              2
            )}
          </IOText>
        </View>
      );
    }, [data, expandable, expanded]);

    const shareData = async () => {
      try {
        // Create a temporary file path
        const filePath = `${RNFS.CachesDirectoryPath}/${title}.json`;
        // Write JSON data to the file
        await RNFS.writeFile(
          filePath,
          JSON.stringify(data, debugInfoReplacer(), 2),
          "utf8"
        );
        await Share.open({
          filename: `${title}.json`,
          type: "application/json",
          url: filePath,
          failOnCancel: false
        });

        await RNFS.unlink(filePath);
      } catch {
        toast.error("Error sharing debug data");
      }
    };

    return (
      <View style={styles.container} testID="DebugPrettyPrintTestID">
        <View style={styles.header}>
          <BodySmall color="white" weight="Semibold">
            {title}
          </BodySmall>
          <HStack space={16}>
            <IconButton
              accessibilityLabel="share"
              color="contrast"
              icon={"shareiOs"}
              iconSize={20}
              onPress={shareData}
            />
            <IconButton
              accessibilityLabel="copy"
              color="contrast"
              icon={"copy"}
              iconSize={20}
              onPress={() =>
                clipboardSetStringWithFeedback(JSON.stringify(data, null, 2))
              }
            />
            {expandable && (
              <IconButton
                accessibilityLabel="show"
                color="contrast"
                icon={expanded ? "eyeHide" : "eyeShow"}
                iconSize={24}
                onPress={() => setExpanded(_ => !_)}
              />
            )}
          </HStack>
        </View>
        {content}
      </View>
    );
  }
);

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

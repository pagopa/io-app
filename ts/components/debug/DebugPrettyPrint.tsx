/*
WARNING: This component is not referenced anywhere, but is used
for development purposes. Please, Don't REMOVE it, thank you!
*/
import {
  BodySmall,
  HStack,
  IOColors,
  IOText,
  IconButton,
  useIOToast
} from "@pagopa/io-app-design-system";
import { useState, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import { Prettify } from "../../types/helpers";
import { clipboardSetStringWithFeedback } from "../../utils/clipboard";
import { truncateObjectStrings } from "./utils";
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
    const toast = useIOToast();
    const [expanded, setExpanded] = useState(isExpanded);

    const content = useMemo(() => {
      if ((expandable && !expanded) || !expandable) {
        return null;
      }

      return (
        <View style={styles.content} pointerEvents="box-only">
          <IOText
            font="FiraCode"
            size={12}
            lineHeight={18}
            color={"grey-700"}
            weight="Medium"
          >
            {JSON.stringify(truncateObjectStrings(data), null, 2)}
          </IOText>
        </View>
      );
    }, [data, expandable, expanded]);

    const shareData = async () => {
      try {
        // Create a temporary file path
        const filePath = `${RNFS.CachesDirectoryPath}/${title}.json`;
        // Write JSON data to the file
        await RNFS.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
        await Share.open({
          filename: `${title}.json`,
          type: "application/json",
          url: filePath,
          failOnCancel: false
        });

        await RNFS.unlink(filePath);
      } catch (err) {
        toast.error("Error sharing debug data");
      }
    };

    return (
      <View testID="DebugPrettyPrintTestID" style={styles.container}>
        <View style={styles.header}>
          <BodySmall weight="Semibold" color="white">
            {title}
          </BodySmall>
          <HStack space={16}>
            <IconButton
              icon={"shareiOs"}
              accessibilityLabel="share"
              iconSize={20}
              onPress={shareData}
              color="contrast"
            />
            <IconButton
              icon={"copy"}
              accessibilityLabel="copy"
              iconSize={20}
              onPress={() =>
                clipboardSetStringWithFeedback(JSON.stringify(data, null, 2))
              }
              color="contrast"
            />
            {expandable && (
              <IconButton
                icon={expanded ? "eyeHide" : "eyeShow"}
                accessibilityLabel="show"
                iconSize={24}
                onPress={() => setExpanded(_ => !_)}
                color="contrast"
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

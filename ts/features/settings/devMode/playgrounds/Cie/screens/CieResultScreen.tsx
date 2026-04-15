import { IOColors, IOText } from "@pagopa/io-app-design-system";
import Clipboard from "@react-native-clipboard/clipboard";
import { Alert, Platform, Share, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IOScrollView } from "../../../../../../components/ui/IOScrollView";
import { useHeaderSecondLevel } from "../../../../../../hooks/useHeaderSecondLevel";
import { IOStackNavigationRouteProps } from "../../../../../../navigation/params/AppParamsList";
import { CiePlaygroundsParamsList } from "../navigation/CiePlaygroundsParamsList";

export type Props = IOStackNavigationRouteProps<
  CiePlaygroundsParamsList,
  "CIE_PLAYGROUNDS_RESULT"
>;

export function CieResultScreen({ route }: Props) {
  const { title, data } = route.params;

  useHeaderSecondLevel({
    title
  });

  const handleCopy = async () => {
    Clipboard.setString(JSON.stringify(data, null, 2));
    Alert.alert("Copied", "Result copied to clipboard");
  };

  const handleShare = async () => {
    try {
      await Share.share(
        {
          message: JSON.stringify(data, null, 2),
          title,
          // Workaround for iOS to set the subject sharing email in some apps
          ...(Platform.OS === "ios" ? { url: title } : {})
        },
        {
          subject: `${title} "Result"`,
          dialogTitle: `Share ${title} "Result"`
        }
      );
    } catch (error) {
      Alert.alert("Error", "Could not share the result");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <IOScrollView
        contentContainerStyle={styles.contentContainer}
        actions={{
          type: "TwoButtons",
          primary: {
            label: "Share",
            onPress: handleShare
          },
          secondary: {
            label: "Copy",
            onPress: handleCopy
          }
        }}
      >
        <View style={styles.content} pointerEvents="box-only">
          <IOText
            font="FiraCode"
            size={12}
            lineHeight={18}
            color={"grey-700"}
            weight="Medium"
          >
            {JSON.stringify(data, null, 2)}
          </IOText>
        </View>
      </IOScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 4,
    gap: 4
  },
  contentContainer: {
    paddingTop: 16,
    paddingBottom: 128
  },
  content: {
    backgroundColor: IOColors["grey-50"],
    padding: 8
  }
});

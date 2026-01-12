import { IOButton } from "@pagopa/io-app-design-system";
import { MrtdResponse } from "@pagopa/io-react-native-cie";
import Clipboard from "@react-native-clipboard/clipboard";
import { RouteProp, useRoute } from "@react-navigation/native";
import {
  Alert,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderSecondLevel } from "../../../../../../../hooks/useHeaderSecondLevel";
import { SettingsParamsList } from "../../../../../common/navigation/params/SettingsParamsList";

export type CieMrtdResultNavParams = {
  result: MrtdResponse;
  encoding: "base64" | "hex";
};

export function CieIasAndMrtdPlaygroundMrtdResultScreen() {
  useHeaderSecondLevel({
    title: "IAS+MRTD Result"
  });

  const route =
    useRoute<
      RouteProp<SettingsParamsList, "CIE_IAS_AND_MRTD_PLAYGROUND_MRTD_RESULTS">
    >();
  const { result, encoding } = route.params;
  const resultString = JSON.stringify({ encoding, ...result }, null, 2);

  const handleCopy = async () => {
    Clipboard.setString(resultString);
    Alert.alert("Copied", "Result copied to clipboard");
  };

  const handleShare = async () => {
    try {
      await Share.share(
        {
          message: resultString,
          title: "Internal Auth Result",
          // Workaround for iOS to set the subject sharing email in some apps
          ...(Platform.OS === "ios" ? { url: "Internal Auth Result" } : {})
        },
        {
          subject: "Internal Auth Result",
          dialogTitle: "Share Internal Auth Result"
        }
      );
    } catch (error) {
      Alert.alert("Error", "Could not share the result");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <Text selectable style={styles.resultText}>
          {resultString}
        </Text>
      </ScrollView>
      <View style={styles.buttonRow}>
        <IOButton variant="outline" label="Copy" onPress={handleCopy} />
        <IOButton variant="outline" label="Share" onPress={handleShare} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 4,
    gap: 4
  },
  scrollView: {
    flex: 1,
    margin: 4
  },
  contentContainer: {
    paddingBottom: 4
  },
  resultText: {
    fontFamily: "monospace",
    fontSize: 14
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 4,
    paddingBottom: 4
  }
});

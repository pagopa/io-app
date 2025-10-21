import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  Share,
  Alert,
  Platform,
  SafeAreaView
} from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { IOButton } from "@pagopa/io-app-design-system";
import { RouteProp, useRoute } from "@react-navigation/native";
import { SettingsParamsList } from "../../../common/navigation/params/SettingsParamsList";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";

export type CieIasAndMrtdAuthResultNavParams = {
  // TODO: https://pagopa.atlassian.net/browse/IOPID-3434
  // Replace `any` with the actual type of the result once the SDK is updated.
  // Add type here: https://github.com/pagopa/io-react-native-cie/blob/16850bb3b95acd67c53e2e1407f50fc48cca2456/src/index.ts#L6
  result: any;
  challenge: string;
  encodedChallenge: string;
  encoding: "base64" | "hex";
};

export function CieIasAndMrtdPlaygroundIntAuthResult() {
  useHeaderSecondLevel({
    title: "CIE IAT+MRTD Playground (Internal Auth Result)"
  });

  const route =
    useRoute<
      RouteProp<
        SettingsParamsList,
        "CIE_IAS_AND_MRTD_PLAYGROUND_INTERNAL_AUTH_RESULTS"
      >
    >();
  const { result, challenge, encodedChallenge, encoding } = route.params;
  const resultString = JSON.stringify(
    { challenge, encoding, encodedChallenge, ...result },
    null,
    2
  );

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

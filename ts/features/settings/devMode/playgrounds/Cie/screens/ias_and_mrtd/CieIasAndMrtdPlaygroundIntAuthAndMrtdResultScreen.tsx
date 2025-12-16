import { useEffect } from "react";
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
import { IOButton, useIOToast } from "@pagopa/io-app-design-system";
import { RouteProp, useRoute } from "@react-navigation/native";
import { InternalAuthAndMrtdResponse } from "@pagopa/io-react-native-cie";
import { SettingsParamsList } from "../../../../../common/navigation/params/SettingsParamsList";
import { useHeaderSecondLevel } from "../../../../../../../hooks/useHeaderSecondLevel";
import { useIODispatch, useIOSelector } from "../../../../../../../store/hooks";
import { isAarInAppDelegationRemoteEnabledSelector } from "../../../../../../../store/reducers/backendStatus/remoteConfig";
import {
  hasSendMandateSelector,
  sendValidationErrorSelector,
  sendValidationStatusSelector
} from "../../../../../../pn/aar/store/reducers/tempAarMandate";
import {
  testAarAcceptMandate,
  testAarClearData
} from "../../../../../../pn/aar/store/actions";
import { useDebugInfo } from "../../../../../../../hooks/useDebugInfo";

export type CieIasAndMrtdResultNavParams = {
  result: InternalAuthAndMrtdResponse;
  challenge: string;
  encodedChallenge: string;
  encoding: "base64" | "hex";
};

export function CieIasAndMrtdPlaygroundIntAuthAndMrtdResultScreen() {
  const dispatch = useIODispatch();
  const toast = useIOToast();
  const aarTempMandateEnabled = useIOSelector(
    isAarInAppDelegationRemoteEnabledSelector
  );
  const hasSendMandate = useIOSelector(hasSendMandateSelector);
  const sendMandateValidationStatus = useIOSelector(
    sendValidationStatusSelector
  );

  const sendValidationError = useIOSelector(sendValidationErrorSelector);
  const debugInfo = sendValidationError
    ? { validationRequest: sendValidationError }
    : {};
  useDebugInfo(debugInfo);

  useHeaderSecondLevel({
    title: "MRTD Reading Result"
  });

  useEffect(
    () => () => {
      if (aarTempMandateEnabled && hasSendMandate) {
        dispatch(testAarClearData());
      }
    },
    [aarTempMandateEnabled, dispatch, hasSendMandate]
  );

  useEffect(() => {
    if (sendMandateValidationStatus != null) {
      if (sendMandateValidationStatus === "failed") {
        toast.error("SEND Validation failed. See Ladybug");
      } else {
        toast.success(`SEND Validation: ${sendMandateValidationStatus}`);
      }
    }
  }, [sendMandateValidationStatus, toast]);

  const route =
    useRoute<
      RouteProp<
        SettingsParamsList,
        "CIE_IAS_AND_MRTD_PLAYGROUND_INTERNAL_AUTH_AND_MRTD_RESULTS"
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
        {aarTempMandateEnabled && hasSendMandate && (
          <IOButton
            variant="outline"
            label="SEND"
            onPress={() => dispatch(testAarAcceptMandate.request(result))}
          />
        )}
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

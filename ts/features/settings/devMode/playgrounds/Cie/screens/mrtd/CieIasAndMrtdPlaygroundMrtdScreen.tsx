import {
  IOButton,
  ListItemSwitch,
  TextInput
} from "@pagopa/io-app-design-system";
import {
  CieManager,
  MrtdResponse,
  type NfcEvent
} from "@pagopa/io-react-native-cie";
import { useHeaderHeight } from "@react-navigation/elements";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderSecondLevel } from "../../../../../../../hooks/useHeaderSecondLevel";
import { useScreenEndMargin } from "../../../../../../../hooks/useScreenEndMargin";
import { useIONavigation } from "../../../../../../../navigation/params/AppParamsList";
import { SETTINGS_ROUTES } from "../../../../../common/navigation/routes";
import { ReadStatusComponent } from "../../components/ReadStatusComponent";
import { ReadStatus } from "../../types/ReadStatus";

export function CieIasAndMrtdPlaygroundMrtdScreen() {
  const navigation = useIONavigation();
  const [status, setStatus] = useState<ReadStatus>("idle");
  const [successResult, setSuccessResult] = useState<MrtdResponse | undefined>(
    undefined
  );
  const [event, setEvent] = useState<NfcEvent>();
  const [can, setCan] = useState<string>("");

  const [isBase64Encoding, setIsBase64Encoding] = useState(false);
  const toggleEncodingSwitch = () =>
    setIsBase64Encoding(previousState => !previousState);

  useHeaderSecondLevel({
    title: "IAS+MRTD Reading"
  });

  const headerHeight = useHeaderHeight();
  const { screenEndMargin } = useScreenEndMargin();

  useEffect(() => {
    const cleanup = [
      // Start listening for NFC events
      CieManager.addListener("onEvent", setEvent),
      // Start listening for errors
      CieManager.addListener("onError", error => {
        setStatus("error");
        Alert.alert(
          "Error during MRTD reading",
          JSON.stringify(error, undefined, 2)
        );
      }),
      // Start listening for attributes success
      CieManager.addListener("onMRTDWithPaceSuccess", result => {
        setStatus("success");
        setSuccessResult(result);
      })
    ];

    return () => {
      // Remove the event listener on unmount
      cleanup.forEach(remove => remove());
      // Ensure the reading is stopped when the screen is unmounted
      void CieManager.stopReading();
    };
  }, []);

  useEffect(() => {
    if (status === "success" && successResult) {
      navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
        screen: SETTINGS_ROUTES.CIE_IAS_AND_MRTD_PLAYGROUND_MRTD_RESULTS,
        params: {
          result: successResult,
          encoding: isBase64Encoding ? "base64" : "hex"
        }
      });
    }
  }, [status, successResult, navigation, isBase64Encoding]);

  const handleStartReading = async () => {
    setEvent(undefined);
    setStatus("reading");

    try {
      await CieManager.startMRTDReading(
        can,
        isBase64Encoding ? "base64" : "hex"
      );
    } catch (e) {
      setStatus("error");
      Alert.alert(
        "Error while reading attributes",
        JSON.stringify(e, undefined, 2)
      );
    }
  };

  const handleStopReading = () => {
    setEvent(undefined);
    setStatus("idle");
    void CieManager.stopReading();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.select({
          ios: "padding",
          android: undefined
        })}
        contentContainerStyle={{
          flex: 1,
          paddingBottom: 100 + screenEndMargin
        }}
        keyboardVerticalOffset={headerHeight}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.progressContainer}>
          <ReadStatusComponent
            progress={event?.progress}
            status={status}
            step={event?.name}
          />
        </View>
        <View style={styles.inputContainer}>
          <ListItemSwitch
            label="Use base64 encoding"
            onSwitchValueChange={toggleEncodingSwitch}
            value={isBase64Encoding}
          />
          <TextInput
            accessibilityLabel="CAN text input field"
            value={can}
            placeholder={"CAN"}
            onChangeText={setCan}
          />
        </View>
        <IOButton
          variant="solid"
          label={status === "reading" ? "Stop" : "Start reading"}
          disabled={can.length < 6}
          onPress={() =>
            status === "reading" ? handleStopReading() : handleStartReading()
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 24,
    gap: 24
  },
  progressContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  inputContainer: {
    justifyContent: "center",
    marginBottom: 16
  },
  keyboardAvoidingView: {
    flex: 1
  }
});

import {
  IOButton,
  ListItemHeader,
  ListItemSwitch,
  OTPInput,
  VSpacer
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
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderSecondLevel } from "../../../../../../hooks/useHeaderSecondLevel";
import { useScreenEndMargin } from "../../../../../../hooks/useScreenEndMargin";
import { ReadStatusComponent } from "../components/ReadStatusComponent";
import { useCieNavigation } from "../navigation/CiePlaygroundsNavigator";
import { CIE_PLAYGROUNDS_ROUTES } from "../navigation/routes";
import { ReadStatus } from "../types/ReadStatus";

const CAN_PIN_LENGTH = 6;

export const CieMrtdScreen = () => {
  const navigation = useCieNavigation();
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
    title: "CIE MRTD with PACE Reading"
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
      navigation.replace(CIE_PLAYGROUNDS_ROUTES.RESULT, {
        title: "MRTD Reading Result",
        data: {
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

  const onCanChanged = (value: string) => {
    setCan(value);

    if (value.length === CAN_PIN_LENGTH) {
      Keyboard.dismiss();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior="padding"
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
            disabled={status !== "idle"}
          />
          <ListItemHeader label="Insert card CAN" />
          <OTPInput
            accessibilityLabel="CAN text input field"
            value={can}
            onValueChange={onCanChanged}
            length={CAN_PIN_LENGTH}
          />
        </View>
        <VSpacer size={16} />
        <IOButton
          variant="solid"
          label={status === "reading" ? "Stop" : "Start reading"}
          disabled={can.length < CAN_PIN_LENGTH}
          onPress={() =>
            status === "reading" ? handleStopReading() : handleStartReading()
          }
        />
        <VSpacer size={16} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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

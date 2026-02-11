import {
  IOButton,
  ListItemHeader,
  OTPInput,
  VSpacer
} from "@pagopa/io-app-design-system";
import { CieManager, type NfcEvent } from "@pagopa/io-react-native-cie";
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

const CIE_PIN_LENGTH = 8;

export const CieCertificateReadingScreen = () => {
  const navigation = useCieNavigation();
  const [code, setCode] = useState<string>("");
  const [status, setStatus] = useState<ReadStatus>("idle");
  const [event, setEvent] = useState<NfcEvent>();

  const headerHeight = useHeaderHeight();
  const { screenEndMargin } = useScreenEndMargin();

  useHeaderSecondLevel({
    title: "CIE Certificate Reading"
  });

  useEffect(() => {
    const cleanup = [
      // Start listening for NFC events
      CieManager.addListener("onEvent", e => {
        setEvent(e);
        CieManager.setCurrentAlertMessage(
          `Reading in progress\n ${getProgressEmojis(e.progress)}`
        );
      }),
      // Start listening for errors
      CieManager.addListener("onError", error => {
        setStatus("error");
        setEvent(undefined);
        Alert.alert("Error", JSON.stringify(error, undefined, 2));
      }),
      // Start listening for success
      CieManager.addListener("onCertificateSuccess", data => {
        setStatus("success");
        navigation.replace(CIE_PLAYGROUNDS_ROUTES.RESULT, {
          title: "Certificate Data",
          data
        });
      })
    ];

    return () => {
      // Remove the event listener on unmount
      cleanup.forEach(remove => remove());
      // Ensure the reading is stopped when the screen is unmounted
      void CieManager.stopReading();
    };
  }, [navigation]);

  const handleStartReading = async () => {
    setEvent(undefined);
    setStatus("reading");

    try {
      await CieManager.startReadingCertificate(code);
    } catch (e) {
      Alert.alert("Unable to read CIE", JSON.stringify(e, undefined, 2));
    }
  };

  const handleStopReading = () => {
    setEvent(undefined);
    setStatus("idle");
    void CieManager.stopReading();
  };

  const onPinChanged = (value: string) => {
    setCode(value);

    if (value.length === CIE_PIN_LENGTH) {
      Keyboard.dismiss();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
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
        <View>
          <ListItemHeader label="Insert card PIN" />
          <OTPInput
            secret
            value={code}
            length={CIE_PIN_LENGTH}
            onValueChange={onPinChanged}
          />
        </View>
        <VSpacer size={16} />
        <IOButton
          label={status === "reading" ? "Stop reading" : "Start reading"}
          disabled={code.length !== 8}
          onPress={() =>
            status === "reading" ? handleStopReading() : handleStartReading()
          }
        />
        <VSpacer size={16} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getProgressEmojis = (progress: number) => {
  // Clamp progress between 0 and 1
  const clampedProgress = Math.max(0, Math.min(1, progress));

  const totalDots = 10; // Length of the progress bar
  const blueDots = Math.round(clampedProgress * totalDots);
  const whiteDots = totalDots - blueDots;

  return "🔵".repeat(blueDots) + "⚪".repeat(whiteDots);
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1
  },
  container: {
    flex: 1,
    marginHorizontal: 24,
    gap: 24
  },
  progressContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

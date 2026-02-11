import {
  IOButton,
  ListItemSwitch,
  TextInput,
  VSpacer
} from "@pagopa/io-app-design-system";
import {
  CieManager,
  InternalAuthResponse,
  type NfcEvent
} from "@pagopa/io-react-native-cie";
import { useHeaderHeight } from "@react-navigation/elements";
import { StackActions } from "@react-navigation/native";
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
import { encodeChallenge } from "../utils/encoding";

export const CieInternalAuthScreen = () => {
  const navigation = useCieNavigation();

  const [status, setStatus] = useState<ReadStatus>("idle");
  const [successResult, setSuccessResult] = useState<
    InternalAuthResponse | undefined
  >(undefined);
  const [event, setEvent] = useState<NfcEvent>();
  const [challenge, setChallenge] = useState<string>("");

  const [isBase64Encoding, setIsBase64Encoding] = useState(false);
  const toggleEncodingSwitch = () =>
    setIsBase64Encoding(previousState => !previousState);

  useHeaderSecondLevel({
    title: "CIE Internal Auth"
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
          "Error during internal authentication",
          JSON.stringify(error, undefined, 2)
        );
      }),
      // Start listening for attributes success
      CieManager.addListener("onInternalAuthenticationSuccess", result => {
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
      navigation.dispatch(
        StackActions.replace(CIE_PLAYGROUNDS_ROUTES.RESULT, {
          title: "Internal Authentication Result",
          data: {
            result: successResult,
            challenge,
            encodedChallenge: encodeChallenge(
              challenge,
              isBase64Encoding ? "base64" : "hex"
            ),
            encoding: isBase64Encoding ? "base64" : "hex"
          }
        })
      );
    }
  }, [status, navigation, challenge, isBase64Encoding, successResult]);

  const handleStartReading = async () => {
    Keyboard.dismiss();
    setEvent(undefined);
    setStatus("reading");

    try {
      await CieManager.startInternalAuthentication(
        challenge,
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
          <TextInput
            accessibilityLabel="Challenge text input field"
            value={challenge}
            placeholder={"Challenge"}
            onChangeText={setChallenge}
            disabled={status !== "idle"}
          />
        </View>
        <VSpacer size={16} />
        <IOButton
          variant="solid"
          label={status === "reading" ? "Stop" : "Start sign"}
          disabled={challenge.length === 0}
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

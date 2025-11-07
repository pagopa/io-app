import {
  IOButton,
  ListItemSwitch,
  TextInput
} from "@pagopa/io-app-design-system";
import { CieManager, type NfcEvent } from "@pagopa/io-react-native-cie";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  View
} from "react-native";

import { useHeaderHeight } from "@react-navigation/elements";
import { SETTINGS_ROUTES } from "../../../../../common/navigation/routes";
import { useIONavigation } from "../../../../../../../navigation/params/AppParamsList";
import { useHeaderSecondLevel } from "../../../../../../../hooks/useHeaderSecondLevel";
import { useScreenEndMargin } from "../../../../../../../hooks/useScreenEndMargin";
import { ReadStatusComponent } from "../../components/ReadStatusComponent";
import { encodeChallenge } from "../../utils/encoding";
import { ReadStatus } from "../../types/ReadStatus";

export function CieIasAndMrtdPlaygroundIntAuthScreen() {
  const navigation = useIONavigation();
  const [status, setStatus] = useState<ReadStatus>("idle");
  const [event, setEvent] = useState<NfcEvent>();
  const [challenge, setChallenge] = useState<string>("");

  const [isBase64Encoding, setIsBase64Encoding] = useState(false);
  const toggleEncodingSwitch = () =>
    setIsBase64Encoding(previousState => !previousState);

  useHeaderSecondLevel({
    title: "Internal Auth"
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
        navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
          screen:
            SETTINGS_ROUTES.CIE_IAS_AND_MRTD_PLAYGROUND_INTERNAL_AUTH_RESULTS,
          params: {
            result,
            challenge,
            encodedChallenge: encodeChallenge(
              challenge,
              isBase64Encoding ? "base64" : "hex"
            ),
            encoding: isBase64Encoding ? "base64" : "hex"
          }
        });
      })
    ];

    return () => {
      // Remove the event listener on unmount
      cleanup.forEach(remove => remove());
      // Ensure the reading is stopped when the screen is unmounted
      void CieManager.stopReading();
    };
  }, [challenge, isBase64Encoding, navigation]);

  const handleStartReading = async () => {
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
            accessibilityLabel="Challenge text input field"
            value={challenge}
            placeholder={"Challenge"}
            onChangeText={setChallenge}
          />
        </View>
        <IOButton
          variant="solid"
          label={status === "reading" ? "Stop" : "Start sign"}
          disabled={challenge.length === 0}
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

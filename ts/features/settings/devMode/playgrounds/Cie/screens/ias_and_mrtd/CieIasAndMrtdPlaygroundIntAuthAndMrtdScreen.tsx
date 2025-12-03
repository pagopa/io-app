import {
  IOButton,
  ListItemSwitch,
  TextInput,
  VSpacer
} from "@pagopa/io-app-design-system";
import {
  CieManager,
  InternalAuthAndMrtdResponse,
  type NfcEvent
} from "@pagopa/io-react-native-cie";
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
import { useIODispatch, useIOSelector } from "../../../../../../../store/hooks";
import { isAarInAppDelegationRemoteEnabledSelector } from "../../../../../../../store/reducers/backendStatus/remoteConfig";
import { testAarCreateMandate } from "../../../../../../pn/aar/store/actions";
import {
  isRequestingSendMandateSelector,
  sendMandateErrorSelector,
  sendVerificationCodeSelector
} from "../../../../../../pn/aar/store/reducers/tempAarMandate";
import { useDebugInfo } from "../../../../../../../hooks/useDebugInfo";

export function CieIasAndMrtdPlaygroundIntAuthAndMrtdScreen() {
  const navigation = useIONavigation();
  const [status, setStatus] = useState<ReadStatus>("idle");
  const [successResult, setSuccessResult] = useState<
    InternalAuthAndMrtdResponse | undefined
  >(undefined);
  const [event, setEvent] = useState<NfcEvent>();
  const [challenge, setChallenge] = useState<string>("");
  const [can, setCan] = useState<string>("");

  const [isBase64Encoding, setIsBase64Encoding] = useState(false);
  const [useSENDChallenge, setUseSENDChallenge] = useState(false);
  const toggleEncodingSwitch = () =>
    setIsBase64Encoding(previousState => !previousState);

  useHeaderSecondLevel({
    title: "MRTD Reading"
  });

  const headerHeight = useHeaderHeight();
  const { screenEndMargin } = useScreenEndMargin();
  const aarTempMandateEnabled = useIOSelector(
    isAarInAppDelegationRemoteEnabledSelector
  );
  const isRequestingSENDMandate = useIOSelector(
    isRequestingSendMandateSelector
  );
  const sendVerificationCode = useIOSelector(sendVerificationCodeSelector);
  const dispatch = useIODispatch();

  const selectedChallenge = useSENDChallenge ? sendVerificationCode : challenge;

  const sendMandateError = useIOSelector(sendMandateErrorSelector);
  const debugInfo = sendMandateError
    ? { mandateRequest: sendMandateError }
    : {};
  useDebugInfo(debugInfo);

  useEffect(() => {
    const cleanup = [
      // Start listening for NFC events
      CieManager.addListener("onEvent", setEvent),
      // Start listening for errors
      CieManager.addListener("onError", error => {
        setStatus("error");
        Alert.alert(
          "Error during Internal Auth + MRTD reading",
          JSON.stringify(error, undefined, 2)
        );
      }),
      // Start listening for attributes success
      CieManager.addListener("onInternalAuthAndMRTDWithPaceSuccess", result => {
        setSuccessResult(result);
        setStatus("success");
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
        screen:
          SETTINGS_ROUTES.CIE_IAS_AND_MRTD_PLAYGROUND_INTERNAL_AUTH_AND_MRTD_RESULTS,
        params: {
          result: successResult,
          challenge: selectedChallenge,
          encodedChallenge: encodeChallenge(
            selectedChallenge,
            isBase64Encoding ? "base64" : "hex"
          ),
          encoding: isBase64Encoding ? "base64" : "hex"
        }
      });
    }
  }, [status, navigation, isBase64Encoding, selectedChallenge, successResult]);

  const handleStartReading = async () => {
    setEvent(undefined);
    setStatus("reading");

    try {
      await CieManager.startInternalAuthAndMRTDReading(
        can,
        selectedChallenge,
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
          {aarTempMandateEnabled && (
            <ListItemSwitch
              label="Use SEND challenge"
              onSwitchValueChange={() =>
                setUseSENDChallenge(prevValue => !prevValue)
              }
              value={useSENDChallenge}
            />
          )}
          <TextInput
            accessibilityLabel="CAN text input field"
            value={can}
            placeholder={"CAN"}
            onChangeText={setCan}
          />
          <VSpacer size={8} />
          <TextInput
            accessibilityLabel="Challenge text input field"
            disabled={useSENDChallenge}
            value={useSENDChallenge ? sendVerificationCode : challenge}
            placeholder={"Challenge"}
            onChangeText={setChallenge}
          />
        </View>
        <IOButton
          variant="solid"
          label={status === "reading" ? "Stop" : "Start sign and reading"}
          disabled={
            !selectedChallenge ||
            selectedChallenge.length === 0 ||
            can.length < 6
          }
          onPress={() =>
            status === "reading" ? handleStopReading() : handleStartReading()
          }
        />
        {useSENDChallenge && (
          <>
            <VSpacer size={8} />
            <IOButton
              loading={isRequestingSENDMandate}
              label="Request SEND Challenge"
              onPress={() => dispatch(testAarCreateMandate.request())}
            />
          </>
        )}
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

import { CieError, CieManager, NfcError } from "@pagopa/io-react-native-cie";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import HapticFeedback, {
  HapticFeedbackTypes
} from "react-native-haptic-feedback";
import { WebViewError } from "react-native-webview/lib/WebViewTypes";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";
import { useScreenReaderEnabled } from "../../../../../utils/accessibility";
import { trackItWalletCieCardReading } from "../../../analytics";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { selectMrtdContext } from "../../../machine/eid/selectors";
import {
  WAIT_TIMEOUT_NAVIGATION,
  WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY
} from "../utils/constants";

export const ItwCieInternalAuthAndMrtdScreen = () => {
  const mrtdContext =
    ItwEidIssuanceMachineContext.useSelector(selectMrtdContext);
  const eidMachine = ItwEidIssuanceMachineContext.useActorRef();
  const isScreenReaderEnabled = useScreenReaderEnabled();
  const machineState = ItwEidIssuanceMachineContext.useSelector(
    snap => snap.value
  );

  const [progress, setProgress] = useState(0);
  const [failure, setFailure] = useState<
    CieError | NfcError | WebViewError | undefined
  >();

  const startCieReading = useCallback(
    async (can: string, challenge: string) => {
      try {
        await CieManager.startInternalAuthAndMRTDReading(
          can,
          challenge,
          "base64"
        );
      } catch (error) {
        setFailure(error as CieError);
      }
    },
    []
  );

  useFocusEffect(useCallback(() => trackItWalletCieCardReading("L3"), []));

  useEffect(() => {
    const cleanup = [
      // Start listening for NFC events
      CieManager.addListener("onEvent", event => {
        setProgress(event.progress);

        // Trigger a light haptic feedback on the start of the reading
        // when the tag is discovered
        if (event.name === "ON_TAG_DISCOVERED") {
          HapticFeedback.trigger(HapticFeedbackTypes.impactLight);
        }
      }),
      // Start listening for errors
      CieManager.addListener("onError", error => {
        setFailure(error);

        // Trigger a warning haptic feedback on TAG_LOST error
        // or an error haptic feedback for all the other errors
        HapticFeedback.trigger(
          error.name === "TAG_LOST"
            ? HapticFeedbackTypes.notificationWarning
            : HapticFeedbackTypes.notificationError
        );
      }),
      // Start listening for success
      CieManager.addListener("onInternalAuthAndMRTDWithPaceSuccess", uri => {
        // On Android we do not receive a final event with progress = 1
        // This mocks allows to have a consistent behavior across platforms
        setProgress(1);

        // Trigger a success haptic feedback
        HapticFeedback.trigger(HapticFeedbackTypes.notificationSuccess);

        // Before proceeding to the next step, give some time to read the success message
        setTimeout(
          () =>
            eidMachine.send({
              type: "internal-auth-and-mrtd-completed",
              data: uri
            }),
          isScreenReaderEnabled
            ? WAIT_TIMEOUT_NAVIGATION_ACCESSIBILITY // If screen reader is enabled, give more time to read the success message
            : WAIT_TIMEOUT_NAVIGATION
        );
      })
    ];

    return () => {
      // Remove the event listener on exit
      cleanup.forEach(remove => remove());
      // Ensure the reading is stopped when state is exited
      void CieManager.stopReading();
    };
  });

  useEffect(() => {
    if (mrtdContext && mrtdContext.can) {
      try {
        void CieManager.startInternalAuthAndMRTDReading(
          mrtdContext.can,
          mrtdContext.challenge,
          "base64"
        );
      } catch (error) {
        setFailure(error as CieError);
      }
    }
  }, [startCieReading, mrtdContext]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LoadingScreenContent contentTitle={I18n.t("global.genericWaiting")} />
    </SafeAreaView>
  );
};

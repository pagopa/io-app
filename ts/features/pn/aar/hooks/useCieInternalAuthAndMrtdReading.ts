import { useCallback, useEffect, useState } from "react";
import {
  CieManager,
  type InternalAuthAndMrtdResponse,
  type NfcError,
  type NfcEvent
} from "@pagopa/io-react-native-cie";
import { constNull } from "fp-ts/lib/function";
import HapticFeedback, {
  HapticFeedbackTypes
} from "react-native-haptic-feedback";
import { Platform } from "react-native";
import i18n from "i18next";
import { getProgressEmojis } from "../../../common/utils/cie";

export const enum ReadStatus {
  IDLE = "IDLE",
  READING = "READING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR"
}

export const useCieInternalAuthAndMrtdReading = () => {
  const [readStatus, setReadStatus] = useState<ReadStatus>(ReadStatus.IDLE);
  const [nfcError, setNfcError] = useState<NfcError>();
  const [nfcEvent, setNfcEvent] = useState<NfcEvent>();
  const [successResult, setSuccessResult] =
    useState<InternalAuthAndMrtdResponse>();

  const startReading = useCallback(
    async (
      ...params: Parameters<typeof CieManager.startInternalAuthAndMRTDReading>
    ) => {
      setNfcEvent(undefined);
      setNfcError(undefined);
      setReadStatus(ReadStatus.IDLE);
      await CieManager.startInternalAuthAndMRTDReading(...params);
    },
    []
  );

  const stopReading = useCallback(() => {
    void CieManager.stopReading();
  }, []);

  useEffect(() => {
    const registeredListeners = [
      // Start listening for NFC events
      CieManager.addListener("onEvent", event => {
        // Trigger a light haptic feedback on the start of the reading
        // when the tag is discovered
        if (event.name === "ON_TAG_DISCOVERED") {
          setReadStatus(ReadStatus.READING);
          HapticFeedback.trigger(HapticFeedbackTypes.impactHeavy);
        }
        setNfcEvent(event);
      }),
      // Start listening for errors
      CieManager.addListener("onError", error => {
        setNfcEvent(undefined);
        setReadStatus(ReadStatus.ERROR);
        setNfcError(error);

        void CieManager.stopReading().catch(constNull);
      }),
      // Start listening for attributes success
      CieManager.addListener("onInternalAuthAndMRTDWithPaceSuccess", result => {
        setReadStatus(ReadStatus.SUCCESS);
        setSuccessResult(result);
      })
    ];

    return () => {
      // Remove the event listener on unmount
      registeredListeners.forEach(remove => remove());
      // Ensure the reading is stopped when the screen is unmounted
      void CieManager.stopReading();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === "ios") {
      CieManager.setAlertMessage(
        "readingInstructions",
        `${getProgressEmojis(0)}\n${i18n.t(
          "features.pn.aar.flow.cieScanning.idle.status"
        )}`
      );
      CieManager.setAlertMessage(
        "readingSuccess",
        `${getProgressEmojis(1)}\n${i18n.t(
          "features.pn.aar.flow.cieScanning.success.status"
        )}`
      );
    }
  }, []);

  const { progress = 0 } = nfcEvent ?? {};
  const progressDots = getProgressEmojis(progress);

  useEffect(() => {
    if (Platform.OS === "ios" && readStatus === ReadStatus.READING) {
      CieManager.setCurrentAlertMessage(
        `${progressDots}\n${i18n.t(
          "features.pn.aar.flow.cieScanning.reading.status"
        )}`
      );
    }
  }, [progressDots, readStatus]);

  return {
    progress,
    readStatus,
    error: nfcError,
    data: successResult,
    startReading,
    stopReading
  };
};

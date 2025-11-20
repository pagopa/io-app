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
      setReadStatus(ReadStatus.IDLE);
      await CieManager.startInternalAuthAndMRTDReading(...params);
    },
    []
  );

  const stopReading = useCallback(() => {
    void CieManager.stopReading();
  }, []);

  useEffect(() => {
    const cleanup = [
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
      cleanup.forEach(remove => remove());
      // Ensure the reading is stopped when the screen is unmounted
      void CieManager.stopReading();
    };
  }, []);

  const { progress = 0 } = nfcEvent ?? {};

  return {
    progress,
    readStatus,
    error: nfcError,
    data: successResult,
    startReading,
    stopReading
  };
};

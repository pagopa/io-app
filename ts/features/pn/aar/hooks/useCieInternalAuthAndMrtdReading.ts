import { useCallback, useEffect, useState } from "react";
import {
  CieManager,
  ResultEncoding,
  type InternalAuthAndMrtdResponse,
  type NfcError
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

type IdleState = {
  status: ReadStatus.IDLE;
};

type ReadingState = {
  status: ReadStatus.READING;
  progress: number;
};

type SuccessState = {
  status: ReadStatus.SUCCESS;
  data: InternalAuthAndMrtdResponse;
};

type ErrorState = {
  status: ReadStatus.ERROR;
  error: NfcError;
};

export type CieReadState = IdleState | ReadingState | SuccessState | ErrorState;

export const isIdleState = (state: CieReadState): state is IdleState =>
  state.status === ReadStatus.IDLE;
export const isReadingState = (state: CieReadState): state is ReadingState =>
  state.status === ReadStatus.READING;
export const isSuccessState = (state: CieReadState): state is SuccessState =>
  state.status === ReadStatus.SUCCESS;
export const isErrorState = (state: CieReadState): state is ErrorState =>
  state.status === ReadStatus.ERROR;

export const useCieInternalAuthAndMrtdReading = () => {
  const [readState, setReadState] = useState<CieReadState>({
    status: ReadStatus.IDLE
  });

  const startReading = useCallback(
    async (can: string, challenge: string, encoding: ResultEncoding) => {
      setReadState(prevState =>
        // Since the state is initialized with `status: ReadStatus.IDLE`,
        // to avoid an unnecessary re-render on the first run,
        // the previous unchanged state is returned.
        isIdleState(prevState) ? prevState : { status: ReadStatus.IDLE }
      );

      await CieManager.startInternalAuthAndMRTDReading(
        can,
        challenge,
        encoding
      );
    },
    []
  );

  const stopReading = useCallback(() => {
    void CieManager.stopReading().catch(constNull);
  }, []);

  useEffect(() => {
    const registeredListeners = [
      // Start listening for NFC events
      CieManager.addListener("onEvent", event => {
        // Trigger a light haptic feedback on the start of the reading
        // when the tag is discovered
        if (event.name === "ON_TAG_DISCOVERED") {
          HapticFeedback.trigger(HapticFeedbackTypes.impactHeavy);
        }
        setReadState({ status: ReadStatus.READING, progress: event.progress });
      }),
      // Start listening for errors
      CieManager.addListener("onError", error => {
        setReadState({ status: ReadStatus.ERROR, error });

        stopReading();
      }),
      // Start listening for attributes success
      CieManager.addListener("onInternalAuthAndMRTDWithPaceSuccess", result => {
        setReadState({ status: ReadStatus.SUCCESS, data: result });
        stopReading();
      })
    ];

    return () => {
      // Remove the event listener on unmount
      registeredListeners.forEach(remove => remove());
      // Ensure the reading is stopped when the screen is unmounted
      stopReading();
    };
  }, [stopReading]);

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

  const statusIsReading = isReadingState(readState);
  const progressDots = getProgressEmojis(
    statusIsReading ? readState.progress : 0
  );

  useEffect(() => {
    if (Platform.OS === "ios" && statusIsReading) {
      CieManager.setCurrentAlertMessage(
        `${progressDots}\n${i18n.t(
          "features.pn.aar.flow.cieScanning.reading.status"
        )}`
      );
    }
  }, [progressDots, statusIsReading]);

  return {
    readState,
    startReading,
    stopReading
  };
};

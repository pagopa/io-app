import { useEffect } from "react";
import {
  trackSendAarMandateCieCanCodeError,
  trackSendAarMandateCieCardReading,
  trackSendAarMandateCieCardReadingError,
  trackSendAarMandateCieCardReadingFailure,
  trackSendAarMandateCieCardReadingSuccess
} from "../analytics";
import {
  CieReadState,
  isErrorState,
  ReadStatus
} from "./useCieInternalAuthAndMrtdReading";

const getNormalizedStatusCode = (readState: CieReadState) => {
  if (isErrorState(readState)) {
    return readState.error.name;
  }

  return readState.status;
};

export const useTrackCieReadingEvents = (
  readState: CieReadState,
  nfcDetected: boolean | undefined
) => {
  const statusCode = getNormalizedStatusCode(readState);
  const errorMessage = isErrorState(readState)
    ? readState.error.message
    : undefined;
  useEffect(() => {
    switch (statusCode) {
      case ReadStatus.IDLE:
        trackSendAarMandateCieCardReading();
        break;
      case ReadStatus.SUCCESS:
        trackSendAarMandateCieCardReadingSuccess();
        break;
      case ReadStatus.READING:
        // No events should be tracked
        break;
      case "TAG_LOST":
        trackSendAarMandateCieCardReadingError();
        break;
      case "WRONG_CAN":
        trackSendAarMandateCieCanCodeError();
        break;
      default:
        trackSendAarMandateCieCardReadingFailure(
          statusCode,
          errorMessage,
          nfcDetected
        );
        break;
    }
  }, [statusCode, errorMessage, nfcDetected]);
};

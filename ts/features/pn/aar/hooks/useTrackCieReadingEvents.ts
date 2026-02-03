import { useEffect } from "react";
import {
  trackSendAarMandateCieCardReading,
  trackSendAarMandateCieCardReadingError,
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

export const useTrackCieReadingEvents = (readState: CieReadState) => {
  const statusCode = getNormalizedStatusCode(readState);

  useEffect(() => {
    switch (statusCode) {
      case ReadStatus.IDLE:
        trackSendAarMandateCieCardReading();
        break;
      case ReadStatus.SUCCESS:
        trackSendAarMandateCieCardReadingSuccess();
        break;
      case "TAG_LOST":
        trackSendAarMandateCieCardReadingError();
        break;
      default:
        break;
    }
  }, [statusCode]);
};

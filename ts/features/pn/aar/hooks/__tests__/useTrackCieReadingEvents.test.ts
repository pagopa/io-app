import { renderHook } from "@testing-library/react-native";
import { CieReadState, ReadStatus } from "../useCieInternalAuthAndMrtdReading";
import { useTrackCieReadingEvents } from "../useTrackCieReadingEvents";
import {
  trackSendAarMandateCieCardReading,
  trackSendAarMandateCieCardReadingError,
  trackSendAarMandateCieCardReadingSuccess
} from "../../analytics";

jest.mock("../../analytics", () => ({
  trackSendAarMandateCieCardReading: jest.fn(),
  trackSendAarMandateCieCardReadingError: jest.fn(),
  trackSendAarMandateCieCardReadingSuccess: jest.fn()
}));

const idleState: CieReadState = {
  status: ReadStatus.IDLE
};

const successState: CieReadState = {
  status: ReadStatus.SUCCESS,
  data: {} as Extract<CieReadState, { status: ReadStatus.SUCCESS }>["data"]
};

const tagLostState: CieReadState = {
  status: ReadStatus.ERROR,
  error: {
    name: "TAG_LOST"
  }
};

const untrackedStates: ReadonlyArray<CieReadState> = [
  {
    status: ReadStatus.READING,
    progress: 0.5
  },
  {
    status: ReadStatus.ERROR,
    error: {
      name: "APDU_ERROR"
    }
  },
  {
    status: ReadStatus.ERROR,
    error: {
      name: "AUTHENTICATION_ERROR"
    }
  },
  {
    status: ReadStatus.ERROR,
    error: {
      name: "CANCELLED_BY_USER"
    }
  },
  {
    status: ReadStatus.ERROR,
    error: {
      name: "CARD_BLOCKED"
    }
  },
  {
    status: ReadStatus.ERROR,
    error: {
      name: "CERTIFICATE_EXPIRED"
    }
  },
  {
    status: ReadStatus.ERROR,
    error: {
      name: "CERTIFICATE_REVOKED"
    }
  },
  {
    status: ReadStatus.ERROR,
    error: {
      name: "GENERIC_ERROR"
    }
  },
  {
    status: ReadStatus.ERROR,
    error: {
      name: "NOT_A_CIE"
    }
  },
  {
    status: ReadStatus.ERROR,
    error: {
      name: "NO_INTERNET_CONNECTION"
    }
  },
  {
    status: ReadStatus.ERROR,
    error: {
      name: "WRONG_CAN"
    }
  },
  {
    status: ReadStatus.ERROR,
    error: {
      name: "WRONG_PIN",
      attemptsLeft: 2
    }
  }
];

describe("useTrackCieReadingEvents", () => {
  it('should call "trackSendAarMandateCieCardReading" once when readState is in IDLE state', () => {
    const { rerender } = renderHook(useTrackCieReadingEvents, {
      initialProps: idleState
    });

    expect(trackSendAarMandateCieCardReading).toHaveBeenCalledTimes(1);
    expect(trackSendAarMandateCieCardReadingSuccess).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingError).not.toHaveBeenCalled();
    (trackSendAarMandateCieCardReading as jest.Mock).mockClear();

    rerender(idleState);

    expect(trackSendAarMandateCieCardReading).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingSuccess).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingError).not.toHaveBeenCalled();
  });

  it('should call "trackSendAarMandateCieCardReadingSuccess" once when readState is in SUCCESS state', () => {
    const { rerender } = renderHook(useTrackCieReadingEvents, {
      initialProps: successState
    });

    expect(trackSendAarMandateCieCardReadingSuccess).toHaveBeenCalledTimes(1);
    expect(trackSendAarMandateCieCardReading).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingError).not.toHaveBeenCalled();
    (trackSendAarMandateCieCardReadingSuccess as jest.Mock).mockClear();

    rerender(successState);

    expect(trackSendAarMandateCieCardReading).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingSuccess).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingError).not.toHaveBeenCalled();
  });

  it('should call "trackSendAarMandateCieCardReadingError" once when readState is in ERROR state and error code is "TAG_LOST"', () => {
    const { rerender } = renderHook(useTrackCieReadingEvents, {
      initialProps: tagLostState
    });

    expect(trackSendAarMandateCieCardReadingError).toHaveBeenCalledTimes(1);
    expect(trackSendAarMandateCieCardReading).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingSuccess).not.toHaveBeenCalled();
    (trackSendAarMandateCieCardReadingError as jest.Mock).mockClear();

    rerender(tagLostState);

    expect(trackSendAarMandateCieCardReading).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingSuccess).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingError).not.toHaveBeenCalled();
  });

  it.each(untrackedStates)(
    "should not track any event when readState is %o",
    readState => {
      const { rerender } = renderHook(useTrackCieReadingEvents, {
        initialProps: readState
      });

      expect(trackSendAarMandateCieCardReading).not.toHaveBeenCalled();
      expect(trackSendAarMandateCieCardReadingSuccess).not.toHaveBeenCalled();
      expect(trackSendAarMandateCieCardReadingError).not.toHaveBeenCalled();

      rerender(readState);

      expect(trackSendAarMandateCieCardReading).not.toHaveBeenCalled();
      expect(trackSendAarMandateCieCardReadingSuccess).not.toHaveBeenCalled();
      expect(trackSendAarMandateCieCardReadingError).not.toHaveBeenCalled();
    }
  );
});

import { renderHook } from "@testing-library/react-native";
import { CieReadState, ReadStatus } from "../useCieInternalAuthAndMrtdReading";
import { useTrackCieReadingEvents } from "../useTrackCieReadingEvents";
import {
  trackSendAarMandateCieCardReading,
  trackSendAarMandateCieCardReadingError,
  trackSendAarMandateCieCardReadingSuccess,
  trackSendAarMandateCieCanCodeError,
  trackSendAarMandateCieCardReadingFailure
} from "../../analytics";

jest.mock("../../analytics", () => ({
  trackSendAarMandateCieCardReading: jest.fn(),
  trackSendAarMandateCieCardReadingError: jest.fn(),
  trackSendAarMandateCieCardReadingSuccess: jest.fn(),
  trackSendAarMandateCieCanCodeError: jest.fn(),
  trackSendAarMandateCieCardReadingFailure: jest.fn()
}));

const idleState: CieReadState = {
  status: ReadStatus.IDLE
};

const successState: CieReadState = {
  status: ReadStatus.SUCCESS,
  data: {} as Extract<CieReadState, { status: ReadStatus.SUCCESS }>["data"]
};

const readingState: CieReadState = {
  status: ReadStatus.READING,
  progress: 0.5
};

const tagLostState: CieReadState = {
  status: ReadStatus.ERROR,
  error: {
    name: "TAG_LOST"
  }
};

const wrongCanState: CieReadState = {
  status: ReadStatus.ERROR,
  error: {
    name: "WRONG_CAN"
  }
};

const readStatesForGenericAnalytics: ReadonlyArray<CieReadState> = [
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
    (trackSendAarMandateCieCardReading as jest.Mock).mockClear();

    rerender(idleState);

    expect(trackSendAarMandateCieCanCodeError).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReading).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingError).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingSuccess).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingFailure).not.toHaveBeenCalled();
  });

  it('should call "trackSendAarMandateCieCardReadingSuccess" once when readState is in SUCCESS state', () => {
    const { rerender } = renderHook(useTrackCieReadingEvents, {
      initialProps: successState
    });

    expect(trackSendAarMandateCieCardReadingSuccess).toHaveBeenCalledTimes(1);
    (trackSendAarMandateCieCardReadingSuccess as jest.Mock).mockClear();

    rerender(successState);

    expect(trackSendAarMandateCieCanCodeError).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReading).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingError).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingSuccess).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingFailure).not.toHaveBeenCalled();
  });

  it('should call "trackSendAarMandateCieCardReadingError" once when readState is in ERROR state and error code is "TAG_LOST"', () => {
    const { rerender } = renderHook(useTrackCieReadingEvents, {
      initialProps: tagLostState
    });

    expect(trackSendAarMandateCieCardReadingError).toHaveBeenCalledTimes(1);
    (trackSendAarMandateCieCardReadingError as jest.Mock).mockClear();

    rerender(tagLostState);

    expect(trackSendAarMandateCieCanCodeError).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReading).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingError).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingSuccess).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingFailure).not.toHaveBeenCalled();
  });

  it('should call "trackSendAarMandateCieCardReadingFailure" once when readState is in ERROR state and error code is "WRONG_CAN"', () => {
    const { rerender } = renderHook(useTrackCieReadingEvents, {
      initialProps: wrongCanState
    });

    expect(trackSendAarMandateCieCanCodeError).toHaveBeenCalledTimes(1);
    (trackSendAarMandateCieCanCodeError as jest.Mock).mockClear();

    rerender(wrongCanState);

    expect(trackSendAarMandateCieCanCodeError).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReading).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingError).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingSuccess).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingFailure).not.toHaveBeenCalled();
  });

  it.each(readStatesForGenericAnalytics)(
    'should track "trackSendAarMandateCieCardReadingFailure" once when readState is %o',
    readState => {
      const { rerender } = renderHook(useTrackCieReadingEvents, {
        initialProps: readState
      });

      expect(trackSendAarMandateCieCardReadingFailure).toHaveBeenCalledTimes(1);
      (trackSendAarMandateCieCardReadingFailure as jest.Mock).mockClear();

      rerender(readState);

      expect(trackSendAarMandateCieCanCodeError).not.toHaveBeenCalled();
      expect(trackSendAarMandateCieCardReading).not.toHaveBeenCalled();
      expect(trackSendAarMandateCieCardReadingError).not.toHaveBeenCalled();
      expect(trackSendAarMandateCieCardReadingSuccess).not.toHaveBeenCalled();
      expect(trackSendAarMandateCieCardReadingFailure).not.toHaveBeenCalled();
    }
  );

  it("should not track any event when readState is in READING state", () => {
    const { rerender } = renderHook(useTrackCieReadingEvents, {
      initialProps: readingState
    });

    rerender(readingState);

    expect(trackSendAarMandateCieCanCodeError).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReading).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingError).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingSuccess).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingFailure).not.toHaveBeenCalled();
  });
});

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

type HookProps = { readState: CieReadState; nfcDetected: boolean | undefined };

describe("useTrackCieReadingEvents", () => {
  it('should call "trackSendAarMandateCieCardReading" once when readState is in IDLE state', () => {
    const { rerender } = renderHook(
      ({ readState, nfcDetected }: HookProps) =>
        useTrackCieReadingEvents(readState, nfcDetected),
      { initialProps: { readState: idleState, nfcDetected: false } }
    );

    expect(trackSendAarMandateCieCardReading).toHaveBeenCalledTimes(1);
    (trackSendAarMandateCieCardReading as jest.Mock).mockClear();

    rerender({ readState: idleState, nfcDetected: false });

    expect(trackSendAarMandateCieCanCodeError).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReading).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingError).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingSuccess).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingFailure).not.toHaveBeenCalled();
  });

  it('should call "trackSendAarMandateCieCardReadingSuccess" once when readState is in SUCCESS state', () => {
    const { rerender } = renderHook(
      ({ readState, nfcDetected }: HookProps) =>
        useTrackCieReadingEvents(readState, nfcDetected),
      { initialProps: { readState: successState, nfcDetected: false } }
    );

    expect(trackSendAarMandateCieCardReadingSuccess).toHaveBeenCalledTimes(1);
    (trackSendAarMandateCieCardReadingSuccess as jest.Mock).mockClear();

    rerender({ readState: successState, nfcDetected: false });

    expect(trackSendAarMandateCieCanCodeError).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReading).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingError).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingSuccess).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingFailure).not.toHaveBeenCalled();
  });

  it('should call "trackSendAarMandateCieCardReadingError" once when readState is in ERROR state and error code is "TAG_LOST"', () => {
    const { rerender } = renderHook(
      ({ readState, nfcDetected }: HookProps) =>
        useTrackCieReadingEvents(readState, nfcDetected),
      { initialProps: { readState: tagLostState, nfcDetected: false } }
    );

    expect(trackSendAarMandateCieCardReadingError).toHaveBeenCalledTimes(1);
    (trackSendAarMandateCieCardReadingError as jest.Mock).mockClear();

    rerender({ readState: tagLostState, nfcDetected: false });

    expect(trackSendAarMandateCieCanCodeError).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReading).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingError).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingSuccess).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingFailure).not.toHaveBeenCalled();
  });

  it('should call "trackSendAarMandateCieCardReadingFailure" once when readState is in ERROR state and error code is "WRONG_CAN"', () => {
    const { rerender } = renderHook(
      ({ readState, nfcDetected }: HookProps) =>
        useTrackCieReadingEvents(readState, nfcDetected),
      { initialProps: { readState: wrongCanState, nfcDetected: false } }
    );

    expect(trackSendAarMandateCieCanCodeError).toHaveBeenCalledTimes(1);
    (trackSendAarMandateCieCanCodeError as jest.Mock).mockClear();

    rerender({ readState: wrongCanState, nfcDetected: false });

    expect(trackSendAarMandateCieCanCodeError).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReading).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingError).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingSuccess).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingFailure).not.toHaveBeenCalled();
  });

  it.each(readStatesForGenericAnalytics)(
    'should track "trackSendAarMandateCieCardReadingFailure" once when readState is %o',
    readState => {
      const { rerender } = renderHook(
        ({ readState: rs, nfcDetected }: HookProps) =>
          useTrackCieReadingEvents(rs, nfcDetected),
        { initialProps: { readState, nfcDetected: false } }
      );

      expect(trackSendAarMandateCieCardReadingFailure).toHaveBeenCalledTimes(1);
      (trackSendAarMandateCieCardReadingFailure as jest.Mock).mockClear();

      rerender({ readState, nfcDetected: false });

      expect(trackSendAarMandateCieCanCodeError).not.toHaveBeenCalled();
      expect(trackSendAarMandateCieCardReading).not.toHaveBeenCalled();
      expect(trackSendAarMandateCieCardReadingError).not.toHaveBeenCalled();
      expect(trackSendAarMandateCieCardReadingSuccess).not.toHaveBeenCalled();
      expect(trackSendAarMandateCieCardReadingFailure).not.toHaveBeenCalled();
    }
  );

  it("should not track any event when readState is in READING state", () => {
    const { rerender } = renderHook(
      ({ readState, nfcDetected }: HookProps) =>
        useTrackCieReadingEvents(readState, nfcDetected),
      { initialProps: { readState: readingState, nfcDetected: false } }
    );

    rerender({ readState: readingState, nfcDetected: false });

    expect(trackSendAarMandateCieCanCodeError).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReading).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingError).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingSuccess).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieCardReadingFailure).not.toHaveBeenCalled();
  });
});

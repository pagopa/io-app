import cieManager, { Event as CEvent } from "@io-app/expo-cie-sdk";
import { act, renderHook } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { setStartActiveSessionLogin } from "../../../../activeSessionLogin/store/actions";
import { trackLoginCieCardReadingError } from "../../../../common/analytics/cieAnalytics";
import { cieAuthenticationError } from "../../store/actions";
import { useCieManager } from "../useCieManager";

jest.mock("../../../../common/analytics/cieAnalytics", () => ({
  trackLoginCieCardReadingError: jest.fn(),
  trackLoginCieCardReadingSuccess: jest.fn()
}));

const mockedCieManager = jest.mocked(cieManager);
const mockedTrackLoginCieCardReadingError = jest.mocked(
  trackLoginCieCardReadingError
);

const createTestStore = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  return createStore(appReducer, initialState as any);
};

const setupTest = ({
  onSuccess = jest.fn(),
  store = createTestStore()
} = {}) => {
  const utils = renderHook(() => useCieManager({ onSuccess }), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
  });
  return { ...utils, onSuccess, store };
};

describe("useCieManager", () => {
  // eslint-disable-next-line functional/no-let
  let emitEvent: (event: CEvent) => void;
  // eslint-disable-next-line functional/no-let
  let emitError: (error: Error) => void;
  // eslint-disable-next-line functional/no-let
  let emitSuccess: (url: string) => void;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedCieManager.onEvent.mockImplementation(cb => {
      emitEvent = cb;
    });
    mockedCieManager.onError.mockImplementation(cb => {
      emitError = cb;
    });
    mockedCieManager.onSuccess.mockImplementation(cb => {
      emitSuccess = cb;
    });
  });

  it("should start in idle state", () => {
    const { result } = setupTest();
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("should move to reading state on ON_TAG_DISCOVERED", async () => {
    const { result } = setupTest();

    await act(async () => {
      await result.current.startReading("12345678", "https://auth.example.com");
    });

    act(() => {
      emitEvent({ event: "ON_TAG_DISCOVERED", attemptsLeft: 3 } as CEvent);
    });

    expect(result.current.state).toEqual({ status: "reading" });
  });

  it("should call onSuccess after the success event and set the success state", async () => {
    jest.useFakeTimers();

    const { result, onSuccess } = setupTest();

    await act(async () => {
      await result.current.startReading("12345678", "https://auth.example.com");
    });

    act(() => {
      emitSuccess("https://consent.example.com");
    });

    expect(result.current.state).toEqual({ status: "success" });

    act(() => {
      jest.runAllTimers();
    });

    expect(onSuccess).toHaveBeenCalledWith("https://consent.example.com");

    jest.useRealTimers();
  });

  it("should set an inline reading-failure state for ON_TAG_LOST and dispatch cieAuthenticationError", async () => {
    const store = createTestStore();
    store.dispatch(setStartActiveSessionLogin());
    const dispatchSpy = jest.spyOn(store, "dispatch");
    const { result } = setupTest({ store });

    await act(async () => {
      await result.current.startReading("12345678", "https://auth.example.com");
    });

    act(() => {
      emitEvent({ event: "ON_TAG_LOST", attemptsLeft: 0 } as CEvent);
    });

    expect(result.current.state.status).toBe("reading-failure");
    expect(mockedTrackLoginCieCardReadingError).toHaveBeenCalledWith("reauth");
    expect(dispatchSpy).toHaveBeenCalledWith(
      cieAuthenticationError(
        expect.objectContaining({
          reason: "ON_TAG_LOST",
          flow: "reauth"
        })
      )
    );
  });

  it("should set an inline reading-failure state for native errors", async () => {
    const { result } = setupTest();

    await act(async () => {
      await result.current.startReading("12345678", "https://auth.example.com");
    });

    act(() => {
      emitError(new Error("native error"));
    });

    expect(result.current.state).toEqual({
      status: "reading-failure",
      failure: "native error"
    });
  });

  it.each([
    "AUTHENTICATION_ERROR",
    "CERTIFICATE_EXPIRED",
    "CERTIFICATE_REVOKED",
    "EXTENDED_APDU_NOT_SUPPORTED",
    "ON_CARD_PIN_LOCKED",
    "ON_NO_INTERNET_CONNECTION",
    "ON_PIN_ERROR",
    "ON_TAG_DISCOVERED_NOT_CIE",
    "PIN Locked",
    "TAG_ERROR_NFC_NOT_SUPPORTED",
    "Function not supported"
  ] as const)(
    "should set a dedicated failure state for the %s error event",
    async failureEvent => {
      const { result } = setupTest();

      await act(async () => {
        await result.current.startReading(
          "12345678",
          "https://auth.example.com"
        );
      });

      act(() => {
        emitEvent({ event: failureEvent, attemptsLeft: 0 } as CEvent);
      });

      expect(result.current.state).toEqual({
        status: "failure",
        failure: { event: failureEvent, attemptsLeft: 0 }
      });
      expect(mockedTrackLoginCieCardReadingError).toHaveBeenCalled();
    }
  );

  it.each([
    "PIN_INPUT_ERROR",
    "START_NFC_ERROR",
    "STOP_NFC_ERROR",
    "SOME_UNHANDLED_EVENT"
  ] as const)(
    "should ignore the %s event and keep the current state",
    async unhandledEvent => {
      const { result } = setupTest();

      await act(async () => {
        await result.current.startReading(
          "12345678",
          "https://auth.example.com"
        );
      });

      act(() => {
        emitEvent({
          event: unhandledEvent as unknown as CEvent["event"],
          attemptsLeft: 0
        } as CEvent);
      });

      expect(result.current.state).toEqual({ status: "idle" });
      expect(mockedTrackLoginCieCardReadingError).not.toHaveBeenCalled();
    }
  );

  it("should set a failure state when starting the reading fails", async () => {
    mockedCieManager.setPin.mockRejectedValueOnce(new Error("boom"));

    const { result } = setupTest();

    await act(async () => {
      await result.current.startReading("12345678", "https://auth.example.com");
    });

    expect(result.current.state.status).toBe("reading-failure");
  });
});

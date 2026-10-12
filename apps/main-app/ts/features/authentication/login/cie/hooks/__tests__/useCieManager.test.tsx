import { CieManager, NfcError, NfcEvent } from "@io-app/expo-cie";
import { act, renderHook } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { setStartActiveSessionLogin } from "../../../../activeSessionLogin/store/actions";
import { trackLoginCieCardReadingError } from "../../../../common/analytics/cieAnalytics";
import { cieAuthenticationError } from "../../store/actions";
import { useCieManager } from "../useCieManager";

jest.mock("@io-app/expo-cie", () => ({
  CieLogger: { setLogMode: jest.fn() },
  CieManager: {
    addListener: jest.fn(),
    setAlertMessage: jest.fn(),
    setCustomIdpUrl: jest.fn(),
    startReading: jest.fn(async () => undefined),
    stopReading: jest.fn(async () => undefined)
  }
}));

jest.mock("../../../../common/analytics/cieAnalytics", () => ({
  trackLoginCieCardReadingError: jest.fn(),
  trackLoginCieCardReadingSuccess: jest.fn()
}));

const mockedCieManager = jest.mocked(CieManager);
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
  let emitEvent: (event: NfcEvent) => void;
  // eslint-disable-next-line functional/no-let
  let emitError: (error: NfcError) => void;
  // eslint-disable-next-line functional/no-let
  let emitSuccess: (url: string) => void;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedCieManager.addListener.mockImplementation((event, callback) => {
      if (event === "onEvent") {
        emitEvent = callback as (event: NfcEvent) => void;
      } else if (event === "onError") {
        emitError = callback as (error: NfcError) => void;
      } else if (event === "onSuccess") {
        emitSuccess = callback as (url: string) => void;
      }
      return jest.fn();
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
      emitEvent({ name: "ON_TAG_DISCOVERED", progress: 0.2 });
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
      emitError({ name: "TAG_LOST" });
    });

    expect(result.current.state.status).toBe("reading-failure");
    expect(mockedTrackLoginCieCardReadingError).toHaveBeenCalledWith("reauth");
    expect(dispatchSpy).toHaveBeenCalledWith(
      cieAuthenticationError(
        expect.objectContaining({
          reason: "TAG_LOST",
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
      emitError({ name: "GENERIC_ERROR", message: "native error" });
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
    "APDU_ERROR",
    "CARD_BLOCKED",
    "NO_INTERNET_CONNECTION",
    "WRONG_PIN",
    "NOT_A_CIE"
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
        emitError({
          name: failureEvent,
          ...(failureEvent === "WRONG_PIN" ? { attemptsLeft: 0 } : {})
        } as NfcError);
      });

      expect(result.current.state).toEqual({
        status: "failure",
        failure: {
          name: failureEvent,
          ...(failureEvent === "WRONG_PIN" ? { attemptsLeft: 0 } : {})
        }
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
          name: unhandledEvent,
          progress: 0
        });
      });

      expect(result.current.state).toEqual({ status: "idle" });
      expect(mockedTrackLoginCieCardReadingError).not.toHaveBeenCalled();
    }
  );

  it("should set a failure state when starting the reading fails", async () => {
    mockedCieManager.startReading.mockRejectedValueOnce(new Error("boom"));

    const { result } = setupTest();

    await act(async () => {
      await result.current.startReading("12345678", "https://auth.example.com");
    });

    expect(result.current.state.status).toBe("reading-failure");
  });
});

import cieManager, { Event as CEvent } from "@pagopa/react-native-cie";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { setStartActiveSessionLogin } from "../../../../activeSessionLogin/store/actions";
import { trackLoginCieCardReadingError } from "../../../../common/analytics/cieAnalytics";
import { cieAuthenticationError } from "../../store/actions";
import { useCieManager } from "../useCieManager";

jest.mock("@pagopa/react-native-cie", () => ({
  __esModule: true,
  default: {
    removeAllListeners: jest.fn(),
    onEvent: jest.fn(),
    onError: jest.fn(),
    onSuccess: jest.fn(),
    enableLog: jest.fn(),
    setCustomIdpUrl: jest.fn(),
    setAuthenticationUrl: jest.fn(),
    setPin: jest.fn(async () => undefined),
    start: jest.fn(async () => undefined),
    startListeningNFC: jest.fn(async () => undefined),
    stopListeningNFC: jest.fn(async () => undefined)
  }
}));

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
}: {
  onSuccess?: jest.Mock;
  store?: ReturnType<typeof createTestStore>;
} = {}) => {
  const utils = renderHook(() => useCieManager({ onSuccess }), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
  });
  return { ...utils, onSuccess, store };
};

// Convenience to grab the onEvent/onError/onSuccess callbacks registered by
// the hook the last time `startReading` was invoked.
const getRegisteredCallbacks = () => ({
  emitEvent: mockedCieManager.onEvent.mock.calls.at(-1)?.[0] as (
    event: CEvent
  ) => void,
  emitError: mockedCieManager.onError.mock.calls.at(-1)?.[0] as (
    error: Error
  ) => void,
  emitSuccess: mockedCieManager.onSuccess.mock.calls.at(-1)?.[0] as (
    url: string
  ) => void
});

describe("useCieManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

    const { emitEvent } = getRegisteredCallbacks();
    act(() => {
      emitEvent({ event: "ON_TAG_DISCOVERED", attemptsLeft: 3 });
    });

    expect(result.current.state).toEqual({ status: "reading" });
  });

  it("should call onSuccess after the success event and set the success state", async () => {
    const { result, onSuccess } = setupTest();

    await act(async () => {
      await result.current.startReading("12345678", "https://auth.example.com");
    });

    const { emitSuccess } = getRegisteredCallbacks();
    act(() => {
      emitSuccess("https://consent.example.com");
    });

    expect(result.current.state).toEqual({ status: "success" });

    await waitFor(
      () => {
        expect(onSuccess).toHaveBeenCalledWith("https://consent.example.com");
      },
      { timeout: 3000 }
    );
  });

  it("should set an inline reading-failure state for ON_TAG_LOST and dispatch cieAuthenticationError", async () => {
    const store = createTestStore();
    // Simulate an active-session (re-authentication) login flow so that
    // `cieLoginFlowSelector` resolves to "reauth" instead of the default "auth".
    store.dispatch(setStartActiveSessionLogin());
    const dispatchSpy = jest.spyOn(store, "dispatch");
    const { result } = setupTest({ store });

    await act(async () => {
      await result.current.startReading("12345678", "https://auth.example.com");
    });

    const { emitEvent } = getRegisteredCallbacks();
    act(() => {
      emitEvent({ event: "ON_TAG_LOST", attemptsLeft: 0 });
    });

    expect(result.current.state.status).toBe("reading-failure");
    expect(mockedTrackLoginCieCardReadingError).toHaveBeenCalledWith("reauth");
    expect(dispatchSpy).toHaveBeenCalledWith(
      cieAuthenticationError(
        expect.objectContaining({
          reason: "ON_TAG_LOST",
          flow: "reauth"
        }) as any
      )
    );
  });

  it("should set an inline reading-failure state for native errors", async () => {
    const { result } = setupTest();

    await act(async () => {
      await result.current.startReading("12345678", "https://auth.example.com");
    });

    const { emitError } = getRegisteredCallbacks();
    act(() => {
      emitError(new Error("native error"));
    });

    expect(result.current.state).toEqual({
      status: "reading-failure",
      failure: "native error"
    });
  });

  it("should set a dedicated failure state for other error events", async () => {
    const { result } = setupTest();

    await act(async () => {
      await result.current.startReading("12345678", "https://auth.example.com");
    });

    const { emitEvent } = getRegisteredCallbacks();
    act(() => {
      emitEvent({ event: "EXTENDED_APDU_NOT_SUPPORTED", attemptsLeft: 0 });
    });

    expect(result.current.state).toEqual({
      status: "failure",
      failure: { event: "EXTENDED_APDU_NOT_SUPPORTED", attemptsLeft: 0 }
    });
  });

  it("should set a failure state when starting the reading fails", async () => {
    mockedCieManager.setPin.mockRejectedValueOnce(new Error("boom"));

    const { result } = setupTest();

    await act(async () => {
      await result.current.startReading("12345678", "https://auth.example.com");
    });

    expect(result.current.state.status).toBe("reading-failure");
  });
});

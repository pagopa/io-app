import { AppState, type AppStateStatus } from "react-native";
import { PERSIST } from "redux-persist";

import { createReduxStartupGate } from "../reduxStartupGate";

const setCurrentAppState = (appState: AppStateStatus) => {
  // eslint-disable-next-line functional/immutable-data
  Object.defineProperty(AppState, "currentState", {
    configurable: true,
    value: appState
  });
};

describe("createReduxStartupGate", () => {
  const removeAppStateListener = jest.fn();
  // eslint-disable-next-line functional/no-let
  let appStateListener: ((state: AppStateStatus) => void) | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    appStateListener = undefined;
    setCurrentAppState("background");
    jest
      .spyOn(AppState, "addEventListener")
      .mockImplementation((_type, listener) => {
        appStateListener = listener;
        return { remove: removeAppStateListener };
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("blocks redux-persist actions while forwarding other actions", () => {
    const { middleware } = createReduxStartupGate();
    const next = jest.fn();
    const dispatch = middleware({
      dispatch: jest.fn(),
      getState: jest.fn()
    })(next);
    const persistAction = { type: PERSIST };
    const regularAction = { type: "test/action" };

    expect(dispatch(persistAction)).toBe(persistAction);
    expect(next).not.toHaveBeenCalled();

    dispatch(regularAction);

    expect(next).toHaveBeenCalledWith(regularAction);
  });

  it("opens the gate and starts once when the app becomes active", () => {
    const { middleware, startWhenAppIsActive } = createReduxStartupGate();
    const startPersistenceAndSagas = jest.fn();
    const next = jest.fn();
    const dispatch = middleware({
      dispatch: jest.fn(),
      getState: jest.fn()
    })(next);
    const persistAction = { type: PERSIST };

    startWhenAppIsActive(startPersistenceAndSagas);
    appStateListener?.("inactive");
    dispatch(persistAction);

    expect(startPersistenceAndSagas).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();

    appStateListener?.("active");
    dispatch(persistAction);
    appStateListener?.("active");

    expect(startPersistenceAndSagas).toHaveBeenCalledTimes(1);
    expect(removeAppStateListener).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(persistAction);
  });

  it("starts immediately when the app is already active", () => {
    setCurrentAppState("active");
    const { startWhenAppIsActive } = createReduxStartupGate();
    const startPersistenceAndSagas = jest.fn();

    startWhenAppIsActive(startPersistenceAndSagas);

    expect(startPersistenceAndSagas).toHaveBeenCalledTimes(1);
    expect(removeAppStateListener).toHaveBeenCalledTimes(1);
  });
});

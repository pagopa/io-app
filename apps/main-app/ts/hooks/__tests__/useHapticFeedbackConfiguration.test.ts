import { isHapticFeedbackEnabled } from "@io-app/expo-device-internal";
import { act, renderHook } from "@testing-library/react-native";
import { AppState, Platform } from "react-native";
import { Settings } from "react-native-pulsar";

import { useHapticFeedbackConfiguration } from "../useHapticFeedbackConfiguration";

const mockIsHapticFeedbackEnabled = jest.mocked(isHapticFeedbackEnabled);
const mockEnableHaptics = jest.mocked(Settings.enableHaptics);
const mockRemoveListener = jest.fn();
const originalAppState = AppState.currentState;

describe("useHapticFeedbackConfiguration", () => {
  beforeAll(() => {
    // eslint-disable-next-line functional/immutable-data -- React Native mocks currentState as a function.
    Object.defineProperty(AppState, "currentState", { value: "active" });
  });

  afterAll(() => {
    // eslint-disable-next-line functional/immutable-data -- Restore the original React Native mock.
    Object.defineProperty(AppState, "currentState", {
      value: originalAppState
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.replaceProperty(Platform, "OS", "android");
    jest.replaceProperty(AppState, "currentState", "active");
    jest
      .spyOn(AppState, "addEventListener")
      .mockReturnValue({ remove: mockRemoveListener });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([
    { name: "enabled", enabled: true },
    { name: "disabled", enabled: false }
  ])("applies the $name Android preference on mount", ({ enabled }) => {
    mockIsHapticFeedbackEnabled.mockReturnValue(enabled);

    renderHook(useHapticFeedbackConfiguration);

    expect(mockIsHapticFeedbackEnabled).toHaveBeenCalledTimes(1);
    expect(mockEnableHaptics).toHaveBeenCalledTimes(1);
    expect(mockEnableHaptics).toHaveBeenCalledWith(enabled);
  });

  test.each([
    { name: "enabling", initial: false, updated: true },
    { name: "disabling", initial: true, updated: false }
  ])(
    "refreshes the preference when $name haptics in background",
    ({ initial, updated }) => {
      mockIsHapticFeedbackEnabled.mockReturnValue(initial);
      renderHook(useHapticFeedbackConfiguration);
      const onAppStateChange = jest.mocked(AppState.addEventListener).mock
        .calls[0][1];

      act(() => onAppStateChange("background"));
      mockIsHapticFeedbackEnabled.mockReturnValue(updated);
      expect(mockEnableHaptics).toHaveBeenCalledTimes(1);

      act(() => onAppStateChange("active"));

      expect(mockIsHapticFeedbackEnabled).toHaveBeenCalledTimes(2);
      expect(mockEnableHaptics).toHaveBeenCalledTimes(2);
      expect(mockEnableHaptics).toHaveBeenLastCalledWith(updated);
    }
  );

  it("waits for activation when mounted in background", () => {
    jest.replaceProperty(AppState, "currentState", "background");
    mockIsHapticFeedbackEnabled.mockReturnValue(false);
    renderHook(useHapticFeedbackConfiguration);
    const onAppStateChange = jest.mocked(AppState.addEventListener).mock
      .calls[0][1];

    expect(mockIsHapticFeedbackEnabled).not.toHaveBeenCalled();
    expect(mockEnableHaptics).not.toHaveBeenCalled();

    act(() => onAppStateChange("active"));

    expect(mockEnableHaptics).toHaveBeenCalledWith(false);
  });

  it("leaves iOS haptics unchanged on mount and foreground", () => {
    jest.replaceProperty(Platform, "OS", "ios");
    renderHook(useHapticFeedbackConfiguration);
    const onAppStateChange = jest.mocked(AppState.addEventListener).mock
      .calls[0][1];

    act(() => onAppStateChange("background"));
    act(() => onAppStateChange("active"));

    expect(mockIsHapticFeedbackEnabled).not.toHaveBeenCalled();
    expect(mockEnableHaptics).not.toHaveBeenCalled();
  });

  it("keeps a stable subscription and removes it on unmount", () => {
    mockIsHapticFeedbackEnabled.mockReturnValue(true);
    const { rerender, unmount } = renderHook(useHapticFeedbackConfiguration);

    rerender(undefined);

    expect(AppState.addEventListener).toHaveBeenCalledTimes(1);
    expect(AppState.addEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    );
    expect(mockEnableHaptics).toHaveBeenCalledTimes(1);

    unmount();

    expect(mockRemoveListener).toHaveBeenCalledTimes(1);
  });
});

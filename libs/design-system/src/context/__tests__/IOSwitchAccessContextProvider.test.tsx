import { isSwitchAccessEnabled } from "@io-app/expo-switch-access";
import { act, render } from "@testing-library/react-native";
import { AppState, AppStateStatus, Text } from "react-native";

import {
  IOSwitchAccessContextProvider,
  useSwitchAccessEnabled
} from "../IOSwitchAccessContextProvider";

const mockIsSwitchAccessEnabled = jest.mocked(isSwitchAccessEnabled);

const SwitchAccessValue = () => {
  const isEnabled = useSwitchAccessEnabled();

  return <Text>{isEnabled ? "Enabled" : "Disabled"}</Text>;
};

describe("IOSwitchAccessContextProvider", () => {
  // eslint-disable-next-line functional/no-let
  let appStateChangeListener: ((state: AppStateStatus) => void) | undefined;
  const removeAppStateListener = jest.fn();

  beforeEach(() => {
    mockIsSwitchAccessEnabled.mockReset().mockResolvedValue(false);
    appStateChangeListener = undefined;
    removeAppStateListener.mockClear();

    jest
      .spyOn(AppState, "addEventListener")
      .mockImplementation((_event, listener) => {
        appStateChangeListener = listener;
        return { remove: removeAppStateListener };
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shares the native query and app-state listener with its consumers", async () => {
    const { getAllByText, unmount } = render(
      <IOSwitchAccessContextProvider>
        <SwitchAccessValue />
        <SwitchAccessValue />
      </IOSwitchAccessContextProvider>
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockIsSwitchAccessEnabled).toHaveBeenCalledTimes(1);
    expect(AppState.addEventListener).toHaveBeenCalledTimes(1);

    mockIsSwitchAccessEnabled.mockResolvedValue(true);
    await act(async () => {
      appStateChangeListener?.("active");
      await Promise.resolve();
    });

    expect(mockIsSwitchAccessEnabled).toHaveBeenCalledTimes(2);
    expect(getAllByText("Enabled")).toHaveLength(2);

    unmount();
    expect(removeAppStateListener).toHaveBeenCalledTimes(1);
  });
});

import { act, render, renderHook } from "@testing-library/react-native";
import { AppState, AppStateStatus } from "react-native";
import { useAnimatedSensor, useReducedMotion } from "react-native-reanimated";

import { RotationSensor } from "../../components/RotationSensor";
import { useIsScreenFocused } from "../useIsScreenFocused";
import { useRotationEffectEnabled } from "../useRotationSensor";

jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("react-native-reanimated");
  return {
    ...actual,
    useAnimatedSensor: jest.fn(() => ({
      sensor: actual.makeMutable({ roll: 0 }),
      unregister: jest.fn(),
      isAvailable: true,
      config: {}
    })),
    useReducedMotion: jest.fn(() => false)
  };
});

jest.mock("../useIsScreenFocused", () => ({
  useIsScreenFocused: jest.fn(() => true)
}));

describe("useRotationEffectEnabled", () => {
  test.each([
    {
      name: "focused, active and motion allowed",
      focused: true,
      reduceMotion: false,
      expected: true
    },
    {
      name: "screen not focused",
      focused: false,
      reduceMotion: false,
      expected: false
    },
    {
      name: "reduce motion on",
      focused: true,
      reduceMotion: true,
      expected: false
    }
  ])("returns $expected when $name", ({ focused, reduceMotion, expected }) => {
    jest.mocked(useIsScreenFocused).mockReturnValue(focused);
    jest.mocked(useReducedMotion).mockReturnValue(reduceMotion);
    const { result } = renderHook(useRotationEffectEnabled);
    expect(result.current).toBe(expected);
  });

  it("is disabled while the app is in the background", () => {
    jest.mocked(useIsScreenFocused).mockReturnValue(true);
    jest.mocked(useReducedMotion).mockReturnValue(false);
    const addEventListener = jest
      .spyOn(AppState, "addEventListener")
      .mockReturnValue({ remove: jest.fn() });
    const { result } = renderHook(useRotationEffectEnabled);
    const setAppState = (state: AppStateStatus) =>
      act(() =>
        addEventListener.mock.calls
          .filter(([type]) => type === "change")
          .forEach(([, listener]) => listener(state))
      );

    setAppState("background");
    expect(result.current).toBe(false);

    setAppState("active");
    expect(result.current).toBe(true);
  });
});

describe("RotationSensor", () => {
  beforeEach(() => jest.mocked(useAnimatedSensor).mockClear());

  test.each([
    { name: "enabled", enabled: true, registered: 1 },
    { name: "disabled", enabled: false, registered: 0 }
  ])(
    "when $name, registers $registered sensor(s)",
    ({ enabled, registered }) => {
      const children = jest.fn((_roll?: unknown) => null);
      render(<RotationSensor enabled={enabled}>{children}</RotationSensor>);
      expect(useAnimatedSensor).toHaveBeenCalledTimes(registered);
      expect(children.mock.calls[0][0] !== undefined).toBe(enabled);
    }
  );
});

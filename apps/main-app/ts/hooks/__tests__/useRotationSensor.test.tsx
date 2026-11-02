import { act, render, renderHook } from "@testing-library/react-native";
import { AppState, AppStateStatus } from "react-native";
import {
  useAnimatedReaction,
  useAnimatedSensor
} from "react-native-reanimated";

import { RotationSensor } from "../../components/RotationSensor";
import { useIsScreenFocused } from "../useIsScreenFocused";
import { useReduceMotionEnabled } from "../useReduceMotionEnabled";
import {
  useRotationEffectEnabled,
  useRotationSensor
} from "../useRotationSensor";

jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("react-native-reanimated");
  return {
    ...actual,
    useAnimatedReaction: jest.fn(),
    useAnimatedSensor: jest.fn(() => ({
      sensor: actual.makeMutable({ roll: 0 }),
      unregister: jest.fn(),
      isAvailable: true,
      config: {}
    }))
  };
});

jest.mock("../useIsScreenFocused", () => ({
  useIsScreenFocused: jest.fn(() => true)
}));

jest.mock("../useReduceMotionEnabled", () => ({
  useReduceMotionEnabled: jest.fn(() => false)
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
    jest.mocked(useReduceMotionEnabled).mockReturnValue(reduceMotion);
    const { result } = renderHook(useRotationEffectEnabled);
    expect(result.current).toBe(expected);
  });

  it("is disabled while the app is in the background", () => {
    jest.mocked(useIsScreenFocused).mockReturnValue(true);
    jest.mocked(useReduceMotionEnabled).mockReturnValue(false);
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

describe("useRotationSensor", () => {
  beforeEach(() => jest.mocked(useAnimatedReaction).mockClear());

  const renderWithReaction = () => {
    const { result } = renderHook(useRotationSensor);
    const reactToRoll = jest.mocked(useAnimatedReaction).mock.calls[0]?.[1];
    if (reactToRoll === undefined) {
      throw new Error("Expected useAnimatedReaction to be registered");
    }

    return {
      result,
      setRoll: (roll: number) =>
        act(() => {
          reactToRoll(roll, null);
        })
    };
  };

  it("uses the first sensor reading as the calibration point", () => {
    const { result, setRoll } = renderWithReaction();

    setRoll(0.5);
    expect(result.current.value).toBe(0);

    setRoll(0.53);
    expect(result.current.value).toBeCloseTo(-0.03);
  });

  it("ignores sub-threshold sensor noise", () => {
    const { result, setRoll } = renderWithReaction();

    setRoll(0.5);
    setRoll(0.5015);

    expect(result.current.value).toBe(0);
  });

  it("updates after accumulated movement crosses the dead zone", () => {
    const { result, setRoll } = renderWithReaction();

    setRoll(0.5);
    setRoll(0.501);
    expect(result.current.value).toBe(0);

    setRoll(0.5021);
    expect(result.current.value).toBeCloseTo(-0.0021, 4);
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

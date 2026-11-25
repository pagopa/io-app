import { act, renderHook, waitFor } from "@testing-library/react-native";
import { AccessibilityInfo } from "react-native";

import { useReduceMotionEnabled } from "../useReduceMotionEnabled";

describe("useReduceMotionEnabled", () => {
  it("updates when the reduce-motion setting changes after mount", async () => {
    const addEventListener = jest.spyOn(AccessibilityInfo, "addEventListener");
    jest
      .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
      .mockResolvedValue(false);

    const { result, unmount } = renderHook(useReduceMotionEnabled);
    expect(result.current).toBe(true);

    await waitFor(() => expect(result.current).toBe(false));

    const onReduceMotionChanged = addEventListener.mock.calls[0][1];
    act(() => {
      Reflect.apply(onReduceMotionChanged, undefined, [true]);
    });
    expect(result.current).toBe(true);

    act(() => {
      Reflect.apply(onReduceMotionChanged, undefined, [false]);
    });
    expect(result.current).toBe(false);
    unmount();
  });
});

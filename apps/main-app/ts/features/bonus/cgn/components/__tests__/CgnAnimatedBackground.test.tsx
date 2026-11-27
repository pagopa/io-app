import { Canvas } from "@shopify/react-native-skia";
import { render } from "@testing-library/react-native";
import { cancelAnimation, withRepeat } from "react-native-reanimated";

import { useReduceMotionEnabled } from "../../../../../hooks/useReduceMotionEnabled";
import { CgnAnimatedBackground } from "../CgnAnimatedBackground";

jest.mock("../../../../../hooks/useReduceMotionEnabled");

jest.mock("@shopify/react-native-skia", () => ({
  Canvas: jest.fn(({ children }: React.PropsWithChildren) => children),
  Path: () => null,
  Skia: {
    Color: (color: string) => color,
    PathBuilder: {
      Make: () => ({
        close: jest.fn(),
        detach: () => ({}),
        moveTo: jest.fn(),
        quadTo: jest.fn()
      })
    }
  }
}));

jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("react-native-reanimated");
  return {
    ...actual,
    cancelAnimation: jest.fn(actual.cancelAnimation),
    withRepeat: jest.fn(actual.withRepeat)
  };
});

describe.each(["card", "discovery"] as const)("%s background", variant => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not enable per-frame canvas measurement while the view may be off-screen", () => {
    jest.mocked(useReduceMotionEnabled).mockReturnValue(true);
    render(<CgnAnimatedBackground variant={variant} />);
    const [props] = jest.mocked(Canvas).mock.calls[0];
    expect(props.onSize).toBeUndefined();
  });

  test.each([true, false])(
    "respects the system reduced motion preference (%s)",
    reduceMotion => {
      jest.mocked(useReduceMotionEnabled).mockReturnValue(reduceMotion);
      const { unmount } = render(<CgnAnimatedBackground variant={variant} />);
      const animationsStarted = jest.mocked(withRepeat).mock.calls.length;

      if (reduceMotion) {
        expect(withRepeat).not.toHaveBeenCalled();
      } else {
        expect(animationsStarted).toBeGreaterThan(0);
      }

      unmount();
      expect(cancelAnimation).toHaveBeenCalledTimes(animationsStarted);
    }
  );

  it("stops all running animations when reduced motion is enabled after mount", () => {
    jest.mocked(useReduceMotionEnabled).mockReturnValue(false);
    const { rerender } = render(<CgnAnimatedBackground variant={variant} />);
    const started = jest.mocked(withRepeat).mock.calls.length;
    expect(started).toBeGreaterThan(0);

    jest.mocked(useReduceMotionEnabled).mockReturnValue(true);
    rerender(<CgnAnimatedBackground variant={variant} />);
    expect(cancelAnimation).toHaveBeenCalledTimes(started);
    expect(withRepeat).toHaveBeenCalledTimes(started);

    jest.mocked(useReduceMotionEnabled).mockReturnValue(false);
    rerender(<CgnAnimatedBackground variant={variant} />);
    expect(withRepeat).toHaveBeenCalledTimes(started * 2);
  });
});

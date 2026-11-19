import { render } from "@testing-library/react-native";
import {
  cancelAnimation,
  useReducedMotion,
  withRepeat
} from "react-native-reanimated";

import { CgnAnimatedBackground } from "../CgnAnimatedBackground";

jest.mock("@shopify/react-native-skia", () => ({
  Canvas: ({ children }: React.PropsWithChildren) => children,
  Path: () => null,
  Skia: {
    Color: (color: string) => color,
    Path: {
      Make: () => ({
        close: jest.fn(),
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
    useReducedMotion: jest.fn(),
    withRepeat: jest.fn(actual.withRepeat)
  };
});

describe.each(["card", "discovery"] as const)("%s background", variant => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each([true, false])(
    "respects the system reduced motion preference (%s)",
    reduceMotion => {
      jest.mocked(useReducedMotion).mockReturnValue(reduceMotion);
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
});

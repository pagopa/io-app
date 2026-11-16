import { useIsFocused } from "@react-navigation/native";
import { act, fireEvent, render } from "@testing-library/react-native";
import { Image, StyleSheet } from "react-native";
import * as Reanimated from "react-native-reanimated";

import { GifImage } from "../GifImage";

const animatedSource = { uri: "animation.gif" };
const staticSource = { uri: "animation.png" };

jest.mock("@react-navigation/native", () => ({
  useIsFocused: jest.fn()
}));
jest.mock("react-native-reanimated", () => {
  const reanimated = jest.requireActual("react-native-reanimated");
  const useReducedMotion = jest.fn();

  return new Proxy(reanimated, {
    get: (target, property) =>
      property === "useReducedMotion"
        ? useReducedMotion
        : Reflect.get(target, property)
  });
});

const mockUseIsFocused = jest.mocked(useIsFocused);
const mockUseReducedMotion = jest.mocked(Reanimated.useReducedMotion);

describe("GifImage", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockUseIsFocused.mockReturnValue(true);
    mockUseReducedMotion.mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("plays the GIF and forwards native image props", () => {
    const { UNSAFE_getByType, getByRole, getAllByRole, queryByText } = render(
      <GifImage
        accessibilityLabel="Tutorial animation"
        pauseAccessibilityLabel="Stop animation"
        playAccessibilityLabel="Play animation"
        source={animatedSource}
        staticSource={staticSource}
      />
    );

    expect(UNSAFE_getByType(Image).props).toMatchObject({
      accessibilityLabel: "Tutorial animation",
      source: animatedSource
    });
    expect(getByRole("button", { name: "Stop animation" })).toBeTruthy();
    expect(getAllByRole("button")).toHaveLength(1);
    expect(
      queryByText("Play animation", { includeHiddenElements: true })
    ).toBeNull();
    expect(
      StyleSheet.flatten(UNSAFE_getByType(Image).props.style).opacity
    ).toBeUndefined();
  });

  it("shows the static image while paused and resumes playback", () => {
    const {
      UNSAFE_getByType,
      getByRole,
      getAllByRole,
      getByText,
      queryByText
    } = render(
      <GifImage
        pauseAccessibilityLabel="Stop animation"
        playAccessibilityLabel="Play animation"
        source={animatedSource}
        staticSource={staticSource}
      />
    );

    fireEvent.press(getByRole("button", { name: "Stop animation" }));
    expect(UNSAFE_getByType(Image).props.source).toEqual(staticSource);
    expect(
      StyleSheet.flatten(UNSAFE_getByType(Image).props.style).opacity
    ).toBe(0.1);
    expect(
      getByText("Play animation", { includeHiddenElements: true })
    ).toBeTruthy();
    expect(getAllByRole("button")).toHaveLength(1);

    fireEvent.press(getByRole("button", { name: "Play animation" }));
    expect(UNSAFE_getByType(Image).props.source).toEqual(animatedSource);
    expect(
      queryByText("Play animation", { includeHiddenElements: true })
    ).toBeNull();
    expect(
      StyleSheet.flatten(UNSAFE_getByType(Image).props.style).opacity
    ).toBeUndefined();
  });

  it.each([
    { name: "autoplay is disabled", autoPlay: false },
    { name: "the playback timeout expires", autoPlay: true }
  ])("shows the play overlay when $name", ({ autoPlay }) => {
    const maxDurationMs = 1000;
    const { UNSAFE_getByType, getByRole, getByText } = render(
      <GifImage
        autoPlay={autoPlay}
        maxDurationMs={maxDurationMs}
        pauseAccessibilityLabel="Stop animation"
        playAccessibilityLabel="Play animation"
        source={animatedSource}
        staticSource={staticSource}
      />
    );

    act(() => jest.advanceTimersByTime(maxDurationMs));

    expect(UNSAFE_getByType(Image).props.source).toEqual(staticSource);
    expect(getByRole("button", { name: "Play animation" })).toBeTruthy();
    expect(
      getByText("Play animation", { includeHiddenElements: true })
    ).toBeTruthy();
  });

  it("unmounts the image while the screen is not focused", () => {
    mockUseIsFocused.mockReturnValue(false);

    const { UNSAFE_queryByType } = render(
      <GifImage
        pauseAccessibilityLabel="Stop animation"
        playAccessibilityLabel="Play animation"
        source={animatedSource}
        staticSource={staticSource}
      />
    );

    expect(UNSAFE_queryByType(Image)).toBeNull();
  });

  it("shows only the static image when reduced motion is enabled", () => {
    mockUseReducedMotion.mockReturnValue(true);

    const { UNSAFE_getByType, queryByRole, queryByText } = render(
      <GifImage
        pauseAccessibilityLabel="Stop animation"
        playAccessibilityLabel="Play animation"
        source={animatedSource}
        staticSource={staticSource}
      />
    );

    expect(UNSAFE_getByType(Image).props.source).toEqual(staticSource);
    expect(queryByRole("button")).toBeNull();
    expect(
      queryByText("Play animation", { includeHiddenElements: true })
    ).toBeNull();
    expect(
      StyleSheet.flatten(UNSAFE_getByType(Image).props.style).opacity
    ).toBeUndefined();
  });
});

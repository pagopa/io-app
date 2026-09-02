import { useIsFocused } from "@react-navigation/native";
import { fireEvent, render } from "@testing-library/react-native";
import { Image } from "react-native";

import { GifImage } from "../GifImage";

const animatedSource = { uri: "animation.gif" };
const staticSource = { uri: "animation.png" };

jest.mock("@react-navigation/native", () => ({
  useIsFocused: jest.fn()
}));

const mockUseIsFocused = jest.mocked(useIsFocused);

describe("GifImage", () => {
  beforeEach(() => {
    mockUseIsFocused.mockReturnValue(true);
  });

  it("plays the GIF and forwards native image props", () => {
    const { UNSAFE_getByType, getByLabelText } = render(
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
    expect(getByLabelText("Stop animation")).toBeTruthy();
  });

  it("shows the static image while paused and resumes playback", () => {
    const { UNSAFE_getByType, getByLabelText } = render(
      <GifImage
        pauseAccessibilityLabel="Stop animation"
        playAccessibilityLabel="Play animation"
        source={animatedSource}
        staticSource={staticSource}
      />
    );

    fireEvent.press(getByLabelText("Stop animation"));
    expect(UNSAFE_getByType(Image).props.source).toEqual(staticSource);

    fireEvent.press(getByLabelText("Play animation"));
    expect(UNSAFE_getByType(Image).props.source).toEqual(animatedSource);
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
});

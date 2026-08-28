import { render } from "@testing-library/react-native";
import { Image } from "react-native";

import { GifImage } from "../GifImage";

const animatedSource = { uri: "animation.gif" };
const staticSource = { uri: "animation.png" };

describe("GifImage", () => {
  test.each([
    {
      expected: animatedSource,
      isPlaying: true,
      name: "animated source while playing",
      staticSource
    },
    {
      expected: staticSource,
      isPlaying: false,
      name: "static source while paused",
      staticSource
    },
    {
      expected: animatedSource,
      isPlaying: false,
      name: "animated source when a static source is unavailable",
      staticSource: undefined
    }
  ])("displays the $name", ({ expected, isPlaying, staticSource: still }) => {
    const { UNSAFE_getByType } = render(
      <GifImage
        accessibilityLabel="Tutorial animation"
        isPlaying={isPlaying}
        source={animatedSource}
        staticSource={still}
      />
    );

    expect(UNSAFE_getByType(Image).props).toMatchObject({
      accessibilityLabel: "Tutorial animation",
      source: expected
    });
  });
});

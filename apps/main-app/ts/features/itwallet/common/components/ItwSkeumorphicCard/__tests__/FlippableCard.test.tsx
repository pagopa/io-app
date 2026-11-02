import { render } from "@testing-library/react-native";
import { StyleSheet, View } from "react-native";

import { FlippableCard } from "../FlippableCard";

jest.mock("react-native-reanimated", () => ({
  createCSSAnimatedComponent: (component: typeof View) => component
}));

describe("FlippableCard", () => {
  it.each([
    {
      name: "default vertical axis",
      flipAxis: undefined,
      transform: "rotateY"
    },
    { name: "vertical axis", flipAxis: "y", transform: "rotateY" },
    {
      name: "horizontal axis for the rotated modal",
      flipAxis: "x",
      transform: "rotateX"
    }
  ] as const)(
    "flips both sides around the $name",
    ({ flipAxis, transform }) => {
      const { getByTestId, rerender } = render(
        <FlippableCard
          BackComponent={<View testID="back" />}
          flipAxis={flipAxis}
          FrontComponent={<View testID="front" />}
        />
      );

      expect(
        StyleSheet.flatten(getByTestId("front").parent?.parent?.props.style)
      ).toMatchObject({
        transform: [{ [transform]: "0deg" }]
      });
      expect(
        StyleSheet.flatten(getByTestId("back").parent?.parent?.props.style)
      ).toMatchObject({
        transform: [{ [transform]: "180deg" }]
      });

      rerender(
        <FlippableCard
          BackComponent={<View testID="back" />}
          flipAxis={flipAxis}
          FrontComponent={<View testID="front" />}
          isFlipped
        />
      );

      expect(
        StyleSheet.flatten(getByTestId("front").parent?.parent?.props.style)
      ).toMatchObject({
        transform: [{ [transform]: "180deg" }]
      });
      expect(
        StyleSheet.flatten(getByTestId("back").parent?.parent?.props.style)
      ).toMatchObject({
        transform: [{ [transform]: "360deg" }]
      });
    }
  );
});

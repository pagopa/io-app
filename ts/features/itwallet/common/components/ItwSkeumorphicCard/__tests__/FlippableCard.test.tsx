import { render } from "@testing-library/react-native";
import { StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";
import { FlippableCard } from "../FlippableCard";

jest.mock("react-native-reanimated", () => ({
  createCSSAnimatedComponent: (Component: any) => Component
}));

type FlippableFaceStyle = ViewStyle & {
  transform?: NonNullable<ViewStyle["transform"]>;
};

type UnsafeTestInstance = {
  props: Record<string, unknown>;
};

const getAllRenderedNodes = (component: ReturnType<typeof render>) =>
  component.UNSAFE_root.findAll(() => true) as Array<UnsafeTestInstance>;

const getFlippableFaceStyle = (node: UnsafeTestInstance) =>
  StyleSheet.flatten<FlippableFaceStyle>(
    node.props?.style as StyleProp<FlippableFaceStyle>
  ) ?? {};

const hasRotateYTransform = (
  transform?: NonNullable<ViewStyle["transform"]>
): transform is NonNullable<ViewStyle["transform"]> =>
  Array.isArray(transform) &&
  transform.some(
    step => !!step && typeof step === "object" && "rotateY" in step
  );

const readFlippableTransforms = (component: ReturnType<typeof render>) =>
  getAllRenderedNodes(component)
    .map(node => getFlippableFaceStyle(node)?.transform)
    .filter(hasRotateYTransform);

const readFlippableFaceStyles = (component: ReturnType<typeof render>) =>
  getAllRenderedNodes(component)
    .map(node => getFlippableFaceStyle(node))
    .filter((style): style is FlippableFaceStyle =>
      hasRotateYTransform(style?.transform)
    );

describe("FlippableCard", () => {
  it("keeps hidden backfaces and applies perspective + rotateY transforms on both faces", () => {
    const component = render(
      <FlippableCard
        FrontComponent={<Text testID="front-face-content">Front</Text>}
        BackComponent={<Text testID="back-face-content">Back</Text>}
        isFlipped={false}
      />
    );

    expect(component.getByTestId("front-face-content")).toBeTruthy();
    expect(component.getByTestId("back-face-content")).toBeTruthy();
    expect(
      readFlippableFaceStyles(component).every(
        style => style.backfaceVisibility === "hidden"
      )
    ).toBe(true);
    expect(readFlippableTransforms(component)).toEqual(
      expect.arrayContaining([
        [{ perspective: 1000 }, { rotateY: "0deg" }],
        [{ perspective: 1000 }, { rotateY: "180deg" }]
      ])
    );
  });

  it("updates rotateY angles when flipped", () => {
    const component = render(
      <FlippableCard
        FrontComponent={<Text>Front</Text>}
        BackComponent={<Text>Back</Text>}
        isFlipped={true}
      />
    );

    expect(readFlippableTransforms(component)).toEqual(
      expect.arrayContaining([
        [{ perspective: 1000 }, { rotateY: "180deg" }],
        [{ perspective: 1000 }, { rotateY: "360deg" }]
      ])
    );
  });
});

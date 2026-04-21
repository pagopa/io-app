import { render } from "@testing-library/react-native";
import { StyleSheet, Text } from "react-native";
import { FlippableCard } from "../FlippableCard";

jest.mock("react-native-reanimated", () => ({
  createCSSAnimatedComponent: (Component: any) => Component
}));

const readFlippableTransforms = (component: ReturnType<typeof render>) =>
  component.UNSAFE_root.findAll(node => {
    const transform = StyleSheet.flatten(node.props?.style)?.transform;
    return (
      Array.isArray(transform) &&
      transform.some(
        step => !!step && typeof step === "object" && "rotateY" in step
      )
    );
  }).map(node => StyleSheet.flatten(node.props.style).transform);

const readFlippableFaceStyles = (component: ReturnType<typeof render>) =>
  component.UNSAFE_root.findAll(node => {
    const transform = StyleSheet.flatten(node.props?.style)?.transform;
    return (
      Array.isArray(transform) &&
      transform.some(
        step => !!step && typeof step === "object" && "rotateY" in step
      )
    );
  }).map(node => StyleSheet.flatten(node.props.style));

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

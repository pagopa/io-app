import { Canvas } from "@shopify/react-native-skia";
import { render } from "@testing-library/react-native";
import { ReactTestRendererJSON } from "react-test-renderer";

import { ItwBrandedSkiaBorder } from "../ItwBrandedSkiaBorder";

const findNodes = (
  node: Array<ReactTestRendererJSON> | null | ReactTestRendererJSON,
  type: string
): Array<ReactTestRendererJSON> => {
  if (node === null) {
    return [];
  }
  if (Array.isArray(node)) {
    return node.flatMap(child => findNodes(child, type));
  }
  const children = (node.children ?? []).filter(
    (child): child is ReactTestRendererJSON => typeof child !== "string"
  );
  return [
    ...(node.type === type ? [node] : []),
    ...children.flatMap(child => findNodes(child, type))
  ];
};

const renderBorder = (themeType: "dark" | "light") =>
  render(
    <Canvas>
      <ItwBrandedSkiaBorder height={200} themeType={themeType} width={300} />
    </Canvas>
  ).toJSON();

describe("ItwBrandedSkiaBorder", () => {
  test.each([
    { themeType: "light" as const, opacity: 1 },
    { themeType: "dark" as const, opacity: 0.64 }
  ])(
    "should paint the stroke with the gradient, without offscreen layers ($themeType)",
    ({ themeType, opacity }) => {
      const tree = renderBorder(themeType);

      const strokes = findNodes(tree, "skRRect");
      expect(strokes).toHaveLength(1);
      expect(strokes[0].props.style).toBe("stroke");
      expect(strokes[0].props.opacity).toBeCloseTo(opacity);
      expect(findNodes(tree, "skLayer")).toHaveLength(0);
    }
  );
});

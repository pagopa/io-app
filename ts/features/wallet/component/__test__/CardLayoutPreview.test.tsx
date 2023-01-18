import { render } from "@testing-library/react-native";
import { View } from "react-native";
import * as React from "react";
import { CardLayoutPreview } from "../card/CardLayoutPreview";

describe("CardLayoutPreview", () => {
  it("should show the left and the right received components", () => {
    const left = () => <View testID="leftComponent" />;
    const right = () => <View testID="right" />;
    const component = render(
      <CardLayoutPreview left={left()} right={right()} />
    );

    expect(component.queryByTestId("leftComponent")).not.toBeNull();
    expect(component.queryByTestId("right")).not.toBeNull();
  });
});

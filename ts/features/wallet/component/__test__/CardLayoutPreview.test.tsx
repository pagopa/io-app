import { render } from "@testing-library/react-native";
import { View } from "native-base";
import * as React from "react";
import { CardLayoutPreview } from "../CardLayoutPreview";

describe("CardLayoutPreview", () => {
  it("should show the left and the right received components", () => {
    const left = () => <View testID="leftComponent"></View>;
    const right = () => <View testID="right"></View>;
    const component = render(
      <CardLayoutPreview left={left()} right={right()} />
    );

    expect(component.queryByTestId("leftComponent")).not.toBeNull();
    expect(component.queryByTestId("right")).not.toBeNull();
  });
});

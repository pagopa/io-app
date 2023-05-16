import React from "react";
import { View } from "react-native";
import { render } from "@testing-library/react-native";

import StatusContent from "../StatusContent";

describe("StatusContent", () => {
  it("should match the snapshot", () => {
    const viewRef = React.createRef<View>();
    const component = render(
      <StatusContent
        accessibilityLabel={"a label"}
        accessibilityRole={"link"}
        backgroundColor={"aqua"}
        foregroundColor={"bluegreyDark"}
        iconName="ok"
        viewRef={viewRef}
      />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

import React from "react";
import { View } from "react-native";
import { render } from "@testing-library/react-native";

import { IOColors } from "../../core/variables/IOColors";
import StatusContent from "../StatusContent";

describe("StatusContent", () => {
  it("should match the snapshot", () => {
    const viewRef = React.createRef<View>();
    const component = render(
      <StatusContent
        accessibilityLabel={"a label"}
        accessibilityRole={"link"}
        backgroundColor={"aqua"}
        iconColor={IOColors.aqua}
        iconName={"io-complete"}
        viewRef={viewRef}
        labelColor={"bluegreyDark"}
      />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

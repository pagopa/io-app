import { render } from "@testing-library/react-native";
import * as React from "react";
import { EIdCardPreview } from "../EIdCardPreview";

describe("EIdCardPreview", () => {
  it("should match the snapshot", () => {
    const component = render(<EIdCardPreview />);
    expect(component).toMatchSnapshot();
  });
});

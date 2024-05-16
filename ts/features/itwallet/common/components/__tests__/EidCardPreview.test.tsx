import { render } from "@testing-library/react-native";
import * as React from "react";
import { EidCardPreview } from "../EidCardPreview";

describe("EidCardPreview", () => {
  it("should match the snapshot", () => {
    const component = render(<EidCardPreview />);
    expect(component).toMatchSnapshot();
  });
});

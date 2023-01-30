import { render } from "@testing-library/react-native";
import React from "react";
import AttachmentsUnavailableComponent from "../AttachmentsUnavailable";

describe("AttachmentsUnavailable component", () => {
  it("should match the snapshot", () => {
    const component = render(<AttachmentsUnavailableComponent />);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

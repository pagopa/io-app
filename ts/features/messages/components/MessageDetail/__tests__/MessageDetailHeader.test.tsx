import React, { ComponentProps } from "react";
import { render } from "@testing-library/react-native";
import { MessageDetailHeader } from "../MessageDetailHeader";

const defaultProps: ComponentProps<typeof MessageDetailHeader> = {
  subject: "Subject",
  createdAt: new Date()
};

describe("MessageDetailHeader component", () => {
  it("should match the snapshot with default props", () => {
    const component = render(<MessageDetailHeader {...defaultProps} />);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

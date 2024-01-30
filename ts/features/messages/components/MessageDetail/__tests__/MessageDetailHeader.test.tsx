import React, { ComponentProps } from "react";
import { render } from "@testing-library/react-native";
import { MessageDetailHeader } from "../MessageDetailHeader";
import { ServicePublic } from "../../../../../../definitions/backend/ServicePublic";

const service = {
  service_id: "serviceId",
  service_name: "health",
  organization_name: "Organization foo",
  department_name: "Department one",
  organization_fiscal_code: "OFSAAAAAA"
} as ServicePublic;

const defaultProps: ComponentProps<typeof MessageDetailHeader> = {
  subject: "Subject",
  createdAt: new Date("2021-10-18T16:00:30.541Z")
};

describe("MessageDetailHeader component", () => {
  it("should match the snapshot with default props", () => {
    const component = render(<MessageDetailHeader {...defaultProps} />);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match the snapshot with all props", () => {
    const component = render(
      <MessageDetailHeader
        {...defaultProps}
        sender="Sender"
        service={service}
      />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

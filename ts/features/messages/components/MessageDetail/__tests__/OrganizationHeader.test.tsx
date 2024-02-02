import React from "react";
import { render } from "@testing-library/react-native";
import { OrganizationHeader } from "../OrganizationHeader";

describe("OrganizationHeader component", () => {
  it("should match the snapshot", () => {
    const component = render(
      <OrganizationHeader
        logoUri={require("../../../../../../img/test/logo.png")}
        organizationName={"#### organization_name ####"}
        serviceName={"#### service name ####"}
      />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

import React from "react";
import { render } from "@testing-library/react-native";
import { ServiceDetailsHeader } from "../ServiceDetailsHeader";

describe("ServiceDetailsHeader component", () => {
  it("should match the snapshot", () => {
    const component = render(
      <ServiceDetailsHeader
        logoUri={require("../../../../../../img/test/logo.png")}
        organizationName={"#### organization_name ####"}
        serviceName={"#### service name ####"}
      />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

import React from "react";
import { render } from "@testing-library/react-native";

import OrganizationHeader from "../OrganizationHeader";

describe("OrganizationHeader", () => {
  it("should match the snapshot", () => {
    const component = render(
      <OrganizationHeader
        organizationName={"Universala Esperanto-Asocio"}
        serviceName={"Avviso"}
        logoURLs={[
          {
            uri: "https://eo.wikipedia.org/wiki/Universala_Esperanto-Asocio#/media/Dosiero:Universala_Esperanto-Asocio.png"
          }
        ]}
      />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

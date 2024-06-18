import { render, fireEvent } from "@testing-library/react-native";
import * as React from "react";
import { ItwCredentialClaimsSection } from "../ItwCredentialClaimsSection";
import { ClaimDisplayFormat } from "../../utils/itwClaimsUtils";

describe("ItwCredentialClaimsSection", () => {
  const claims: Array<ClaimDisplayFormat> = [
    { id: "name", label: "Nome", value: "Luigi" },
    { id: "surname", label: "Cognome", value: "Rossi" },
    { id: "age", label: "Età", value: 20 }
  ];

  it("should match the snapshot when claims are visible", () => {
    const component = render(
      <ItwCredentialClaimsSection
        title="Personal data"
        claims={claims}
        canHideValues
      />
    );
    expect(component).toMatchSnapshot();
  });

  it("should match the snapshot when claims are hidden", () => {
    const component = render(
      <ItwCredentialClaimsSection
        title="Personal data"
        claims={claims}
        canHideValues
      />
    );
    const toggleButton = component.queryByTestId("toggle-claim-visibility");

    if (!toggleButton) {
      fail("Toggle button not found");
    }

    fireEvent(toggleButton, "onPress");
    expect(component).toMatchSnapshot();
  });
});

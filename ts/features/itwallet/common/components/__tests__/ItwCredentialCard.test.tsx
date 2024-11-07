import { render } from "@testing-library/react-native";
import * as React from "react";
import { CredentialType } from "../../utils/itwMocksUtils";
import { ItwCredentialCard } from "../ItwCredentialCard";
import { ItwCredentialStatus } from "../../utils/itwTypesUtils";

describe("ItwCredentialCard", () => {
  it.each(["EuropeanHealthInsuranceCard", "EuropeanDisabilityCard", "MDL"])(
    "should match snapshot when credential type is %p",
    type => {
      const component = render(<ItwCredentialCard credentialType={type} />);
      expect(component).toMatchSnapshot();
    }
  );

  it.each([
    "valid",
    "expired",
    "expiring",
    "pending"
  ] as ReadonlyArray<ItwCredentialStatus>)(
    "should match snapshot when status is %p",
    status => {
      const component = render(
        <ItwCredentialCard credentialType={"MDL"} status={status} />
      );
      expect(component).toMatchSnapshot();
    }
  );

  it("should render the preview", () => {
    const component = render(
      <ItwCredentialCard
        credentialType={CredentialType.DRIVING_LICENSE}
        isPreview={true}
      />
    );
    expect(component).toMatchSnapshot();
  });
});

import { render } from "@testing-library/react-native";
import * as React from "react";
import { CredentialType } from "../../utils/itwMocksUtils";
import { ItwCredentialCard, ItwCredentialStatus } from "../ItwCredentialCard";

describe("ItwCredentialCard", () => {
  it.each([
    "valid",
    "expired",
    "expiring",
    "pending"
  ] as ReadonlyArray<ItwCredentialStatus>)(
    "should match snapshot when status is %p",
    status => {
      const component = render(
        <ItwCredentialCard
          credentialType={CredentialType.PID}
          data={["ABCDEFG ABCDEFG", "AAAAAA99A99A999A"]}
          status={status}
        />
      );
      expect(component).toMatchSnapshot();
    }
  );

  it("should render the preview", () => {
    const component = render(
      <ItwCredentialCard credentialType={CredentialType.PID} isPreview={true} />
    );
    expect(component).toMatchSnapshot();
  });
});

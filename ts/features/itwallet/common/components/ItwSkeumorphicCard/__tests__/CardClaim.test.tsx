import { render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";
import { FiscalCodeClaim, StringClaim } from "../../../utils/itwClaimsUtils";
import { CardClaim, CardClaimRenderer } from "../CardClaim";

describe("CardClaim", () => {
  it("should return null if claim is not decoded correctly", () => {
    const { queryByTestId } = render(
      <CardClaim
        testID="claimTestID"
        claim={{ name: "test", value: undefined }}
      />
    );

    expect(queryByTestId("claimTestID")).toBeFalsy();
  });

  it("should render correctly if claim is successfully decoded", () => {
    const { queryByText, queryByTestId } = render(
      <CardClaim
        testID="claimTestID"
        claim={{ name: "test", value: "Some string" }}
      />
    );

    expect(queryByText("Some string")).toBeTruthy();
    expect(queryByTestId("claimTestID")).toBeTruthy();
  });
});

describe("CardClaimRenderer", () => {
  it("should return null if claim is not decoded correctly", () => {
    const { queryByTestId, queryByText } = render(
      <CardClaimRenderer
        claim={{ name: "test", value: "Some string" }}
        is={FiscalCodeClaim.is}
        component={() => (
          <Text testID="claimTestID">This should not be rendered!</Text>
        )}
      />
    );

    expect(queryByTestId("claimTestID")).toBeFalsy();
    expect(queryByText("This should not be rendered!")).toBeFalsy();
  });

  it("should render correctly if claim is successfully decoded", () => {
    const { queryByTestId, queryByText } = render(
      <CardClaimRenderer
        claim={{ name: "test", value: "Some string" }}
        is={StringClaim.is}
        component={decoded => <Text testID="claimTestID">{decoded}</Text>}
      />
    );

    expect(queryByText("Some string")).toBeTruthy();
    expect(queryByTestId("claimTestID")).toBeTruthy();
  });
});

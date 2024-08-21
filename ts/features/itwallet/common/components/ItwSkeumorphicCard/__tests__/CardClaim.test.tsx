import React from "react";
import { render } from "@testing-library/react-native";
import { CardClaim } from "../CardClaim";

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

import { render } from "@testing-library/react-native";
import { Text } from "react-native";

import {
  DrivingPrivilegesClaim,
  FiscalCodeClaim,
  StringClaim
} from "../../../utils/itwClaimsUtils";
import { CardClaim, CardClaimRenderer } from "../CardClaim";

describe("CardClaim", () => {
  it("should return null if claim is not decoded correctly", () => {
    const { queryByTestId } = render(
      <CardClaim
        claim={{ name: "test", value: undefined }}
        testID="claimTestID"
      />
    );

    expect(queryByTestId("claimTestID")).toBeFalsy();
  });

  it("should render correctly if claim is successfully decoded", () => {
    const { queryByText, queryByTestId } = render(
      <CardClaim
        claim={{ name: "test", value: "Some string" }}
        testID="claimTestID"
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
        component={() => (
          <Text testID="claimTestID">This should not be rendered!</Text>
        )}
        is={FiscalCodeClaim.is}
      />
    );

    expect(queryByTestId("claimTestID")).toBeFalsy();
    expect(queryByText("This should not be rendered!")).toBeFalsy();
  });

  it("should correctly render a string claim", () => {
    const { queryByTestId, queryByText } = render(
      <CardClaimRenderer
        claim={{ name: "test", value: "Some string" }}
        component={decoded => <Text testID="claimTestID">{decoded}</Text>}
        is={StringClaim.is}
      />
    );

    expect(queryByText("Some string")).toBeTruthy();
    expect(queryByTestId("claimTestID")).toBeTruthy();
  });

  it("should correctly render a driving privilege claim", () => {
    const { queryByTestId, queryByText } = render(
      <CardClaimRenderer
        claim={{
          name: "test",
          value:
            '[{"driving_privilege":"AM","issue_date":"1935-01-23","expiry_date":"2035-02-16","restrictions_conditions":""},{"driving_privilege":"B","issue_date":"1935-01-23","expiry_date":"2035-02-16","restrictions_conditions":""}]'
        }}
        component={decoded =>
          decoded.map(p => (
            <Text
              key={p.driving_privilege}
              testID={`claimTestID_${p.driving_privilege}`}
            >
              {p.driving_privilege}
            </Text>
          ))
        }
        is={DrivingPrivilegesClaim.is}
      />
    );

    expect(queryByText("AM")).toBeTruthy();
    expect(queryByText("B")).toBeTruthy();
    expect(queryByTestId("claimTestID_AM")).toBeTruthy();
    expect(queryByTestId("claimTestID_B")).toBeTruthy();
  });
});

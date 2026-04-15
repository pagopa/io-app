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

  it("should correctly render a string claim", () => {
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

  it("should correctly render a driving privilege claim", () => {
    const { queryByTestId, queryByText } = render(
      <CardClaimRenderer
        claim={{
          name: "test",
          value:
            '[{"driving_privilege":"AM","issue_date":"1935-01-23","expiry_date":"2035-02-16","restrictions_conditions":""},{"driving_privilege":"B","issue_date":"1935-01-23","expiry_date":"2035-02-16","restrictions_conditions":""}]'
        }}
        is={DrivingPrivilegesClaim.is}
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
      />
    );

    expect(queryByText("AM")).toBeTruthy();
    expect(queryByText("B")).toBeTruthy();
    expect(queryByTestId("claimTestID_AM")).toBeTruthy();
    expect(queryByTestId("claimTestID_B")).toBeTruthy();
  });
});

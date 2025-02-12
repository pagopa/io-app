import { fireEvent, render } from "@testing-library/react-native";
import { constNull } from "fp-ts/lib/function";
import {
  DisclosureClaim,
  ItwOptionalClaimsList,
  ItwRequiredClaimsList
} from "../ItwClaimsDisclosure";

const claims: Array<DisclosureClaim> = [
  { claim: { id: "claim1", label: "Claim 1", value: "1" }, source: "Issuer" },
  { claim: { id: "claim2", label: "Claim 2", value: "2" }, source: "Issuer" },
  { claim: { id: "claim3", label: "Claim 3", value: "3" }, source: "Issuer" }
];

describe("ItwRequiredClaimsList", () => {
  it("should match snapshot", () => {
    const component = render(<ItwRequiredClaimsList items={claims} />);
    expect(component).toMatchSnapshot();
  });
});

describe("ItwOptionalClaimsList", () => {
  it("should match snapshot", () => {
    const component = render(
      <ItwOptionalClaimsList
        items={claims}
        selectedClaims={[]}
        onSelectionChange={constNull}
      />
    );
    expect(component).toMatchSnapshot();
  });

  it("should select claims", () => {
    const onSelectionChange = jest.fn();
    const { getByTestId } = render(
      <ItwOptionalClaimsList
        items={claims}
        selectedClaims={[]}
        onSelectionChange={onSelectionChange}
      />
    );

    fireEvent(getByTestId("ClaimCheckbox_claim1"), "onPress");

    expect(onSelectionChange).toHaveBeenCalledWith("claim1");
  });
});

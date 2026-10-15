import { ListItemInfo } from "@io-app/design-system";
import { fireEvent, render } from "@testing-library/react-native";

import { withStore } from "../../../../../utils/jest/withStore";
import { HIDDEN_CLAIM_TEXT } from "../../utils/constants";
import { getSafeText } from "../../utils/itwClaimsUtils";
import { ItwCredentialClaim as ItwCredentialClaimComponent } from "../ItwCredentialClaim";

const ItwCredentialClaim = withStore(ItwCredentialClaimComponent);

const LABEL = "Claim label";

const longPressableScenarios = [
  { name: "string", value: "Mario", expected: "Mario" },
  {
    name: "url",
    value: "https://example.com",
    expected: "https://example.com"
  },
  { name: "date", value: "1990-01-31", expected: "31/01/1990" },
  {
    name: "fiscal code",
    value: "TINIT-RSSMRA90A31H501X",
    expected: "RSSMRA90A31H501X"
  },
  { name: "list", value: ["IT", "FR"], expected: "IT, FR" }
];

describe("ItwCredentialClaim", () => {
  test.each(longPressableScenarios)(
    "invokes onLongPress with the $name claim label and value",
    ({ value, expected }) => {
      const onLongPress = jest.fn();
      const { getByText } = render(
        <ItwCredentialClaim
          claim={{ id: "claim", label: LABEL, value }}
          onLongPress={onLongPress}
        />
      );

      fireEvent(getByText(expected), "onLongPress");

      expect(onLongPress).toHaveBeenCalledWith(LABEL, expected);
    }
  );

  test.each(longPressableScenarios)(
    "does not enable the long press when the $name claim value is hidden",
    ({ value }) => {
      // `fireEvent` would reach the `onLongPress` prop of `ItwCredentialClaim`
      // itself, so the rendered list item is inspected instead
      const { getByText, UNSAFE_getByType } = render(
        <ItwCredentialClaim
          claim={{ id: "claim", label: LABEL, value }}
          hidden
          onLongPress={jest.fn()}
        />
      );

      expect(getByText(HIDDEN_CLAIM_TEXT)).toBeTruthy();
      expect(UNSAFE_getByType(ListItemInfo).props.onLongPress).toBeUndefined();
    }
  );

  it("invokes onLongPress with the full value when the displayed text is truncated", () => {
    const longValue = "A".repeat(200);
    const onLongPress = jest.fn();
    const { getByText } = render(
      <ItwCredentialClaim
        claim={{ id: "claim", label: LABEL, value: longValue }}
        onLongPress={onLongPress}
      />
    );

    fireEvent(getByText(getSafeText(longValue)), "onLongPress");

    expect(onLongPress).toHaveBeenCalledWith(LABEL, longValue);
  });

  it("forwards onLongPress to nested object claims", () => {
    const onLongPress = jest.fn();
    const { getByText } = render(
      <ItwCredentialClaim
        claim={{
          id: "claim",
          label: LABEL,
          value: { nested: { name: "Nested", value: "Mario" } }
        }}
        onLongPress={onLongPress}
      />
    );

    fireEvent(getByText("Mario"), "onLongPress");

    expect(onLongPress).toHaveBeenCalledWith("Nested", "Mario");
  });
});

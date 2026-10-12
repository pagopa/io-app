import { fireEvent, render } from "@testing-library/react-native";

import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";
import { withStore } from "../../../../../utils/jest/withStore";
import { trackCopyListItem } from "../../../analytics";
import { HIDDEN_CLAIM_TEXT } from "../../utils/constants";
import { ItwCredentialClaim as ItwCredentialClaimComponent } from "../ItwCredentialClaim";

jest.mock("../../../../../utils/clipboard", () => ({
  clipboardSetStringWithFeedback: jest.fn()
}));

jest.mock("../../../analytics", () => ({
  ...jest.requireActual("../../../analytics"),
  trackCopyListItem: jest.fn()
}));

const ItwCredentialClaim = withStore(ItwCredentialClaimComponent);

const LABEL = "Claim label";

const copyableScenarios = [
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each(copyableScenarios)(
    "copies the $name claim value on long press",
    ({ value, expected }) => {
      const { getByText } = render(
        <ItwCredentialClaim
          claim={{ id: "claim", label: LABEL, value }}
          credentialType="MDL"
        />
      );

      fireEvent(getByText(expected), "onLongPress");

      expect(clipboardSetStringWithFeedback).toHaveBeenCalledWith(expected);
      expect(trackCopyListItem).toHaveBeenCalledWith(
        expect.objectContaining({ item_copied: LABEL })
      );
    }
  );

  test.each(copyableScenarios)(
    "does not copy the $name claim value in preview mode",
    ({ value, expected }) => {
      const { getByText } = render(
        <ItwCredentialClaim
          claim={{ id: "claim", label: LABEL, value }}
          isPreview
        />
      );

      fireEvent(getByText(expected), "onLongPress");

      expect(clipboardSetStringWithFeedback).not.toHaveBeenCalled();
    }
  );

  test.each(copyableScenarios)(
    "does not copy the $name claim value when hidden",
    ({ value }) => {
      const { getByText } = render(
        <ItwCredentialClaim
          claim={{ id: "claim", label: LABEL, value }}
          hidden
        />
      );

      fireEvent(getByText(HIDDEN_CLAIM_TEXT), "onLongPress");

      expect(clipboardSetStringWithFeedback).not.toHaveBeenCalled();
    }
  );

  it("does not track the copy when the credential type is unknown", () => {
    const { getByText } = render(
      <ItwCredentialClaim
        claim={{ id: "claim", label: LABEL, value: "Mario" }}
      />
    );

    fireEvent(getByText("Mario"), "onLongPress");

    expect(clipboardSetStringWithFeedback).toHaveBeenCalledWith("Mario");
    expect(trackCopyListItem).not.toHaveBeenCalled();
  });
});

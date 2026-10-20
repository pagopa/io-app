import { fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";

import { StoredConsentData } from "../../store/types";
import {
  getConsentSavedAtDescription,
  ItwConsentManagementListItem
} from "../ItwConsentManagementListItem";

const consent: StoredConsentData = {
  credentials: [{ claimNames: ["given_name"], credentialType: "mDL" }],
  rpDisplayName: "Ministero dell'Interno",
  rpId: "verifier.example.it",
  savedAt: "2029-02-20T12:00:00.000Z"
};

describe("ItwConsentManagementListItem", () => {
  it("renders the RP display name and saved date", () => {
    const onPress = jest.fn();
    const component = render(
      <ItwConsentManagementListItem consent={consent} onPress={onPress} />
    );

    expect(component.getByText(consent.rpDisplayName!)).toBeTruthy();
    expect(
      component.getByText(getConsentSavedAtDescription(consent.savedAt)!)
    ).toBeTruthy();

    fireEvent.press(
      component.getByLabelText(
        I18n.t(
          "features.itWallet.presentation.proximity.consentManagement.accessibility.openDetail",
          { relyingParty: consent.rpDisplayName }
        )
      )
    );

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it.each([undefined, "invalid-date"])(
    "omits a date description for legacy or invalid value %s",
    savedAt => {
      expect(getConsentSavedAtDescription(savedAt)).toBeUndefined();
    }
  );
});

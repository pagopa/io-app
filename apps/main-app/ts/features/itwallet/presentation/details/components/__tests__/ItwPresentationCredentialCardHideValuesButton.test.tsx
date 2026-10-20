import { render } from "@testing-library/react-native";
import I18n from "i18next";

import { ItwPresentationCredentialCardHideValuesButton } from "../ItwPresentationCredentialCardHideValuesButton.tsx";

describe("ItwPresentationCredentialCardHideValuesButton", () => {
  test.each([
    {
      valuesHidden: false,
      label: I18n.t(
        "features.itWallet.presentation.credentialDetails.card.hideValues"
      )
    },
    {
      valuesHidden: true,
      label: I18n.t(
        "features.itWallet.presentation.credentialDetails.card.showValues"
      )
    }
  ])("exposes $label as a button", ({ valuesHidden, label }) => {
    const component = render(
      <ItwPresentationCredentialCardHideValuesButton
        handleOnPress={jest.fn()}
        valuesHidden={valuesHidden}
      />
    );

    expect(component.getByRole("button", { name: label })).toBeTruthy();
  });
});

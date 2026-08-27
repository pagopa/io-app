import { render } from "@testing-library/react-native";
import I18n from "i18next";

import { ItwPresentationCredentialCardFlipButton } from "../ItwPresentationCredentialCardFlipButton.tsx";

describe("ItwPresentationCredentialCardFlipButton", () => {
  test.each([
    {
      isFlipped: false,
      label: I18n.t(
        "features.itWallet.presentation.credentialDetails.card.showBack"
      )
    },
    {
      isFlipped: true,
      label: I18n.t(
        "features.itWallet.presentation.credentialDetails.card.showFront"
      )
    }
  ])("exposes $label as a button", ({ isFlipped, label }) => {
    const component = render(
      <ItwPresentationCredentialCardFlipButton
        handleOnPress={jest.fn()}
        isFlipped={isFlipped}
      />
    );

    expect(component.getByRole("button", { name: label })).toBeTruthy();
  });
});

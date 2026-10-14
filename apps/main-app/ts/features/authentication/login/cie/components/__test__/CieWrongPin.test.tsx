import { fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";
import { Linking } from "react-native";

import { CieWrongPin } from "../CieWrongPin";

const mockNavigate = jest.fn();
const mockNavigateToAuthenticationScreen = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual<typeof import("@react-navigation/native")>(
    "@react-navigation/native"
  ),
  useNavigation: () => ({
    navigate: mockNavigate
  })
}));

jest.mock(
  "../../../../activeSessionLogin/utils/useActiveSessionLoginNavigation",
  () => ({
    __esModule: true,
    default: jest.fn(() => ({
      navigateToAuthenticationScreen: mockNavigateToAuthenticationScreen
    }))
  })
);

describe("CieWrongPin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
  });

  it("should render the locked pin content and open the PUK recovery page when remainingCount is 0", () => {
    const { getByText } = render(<CieWrongPin remainingCount={0} />);

    expect(
      getByText(I18n.t("authentication.cie.pin.lockedCiePinTitle"))
    ).toBeTruthy();

    fireEvent.press(
      getByText(I18n.t("authentication.cie.pin.lockedSecondaryActionLabel"))
    );
    expect(Linking.openURL).toHaveBeenCalledWith(
      "https://www.cartaidentita.interno.gov.it/info-utili/recupero-puk/"
    );

    fireEvent.press(getByText(I18n.t("global.buttons.close")));
    expect(mockNavigateToAuthenticationScreen).toHaveBeenCalled();
  });

  it("should render the second-attempt content and open the PIN recovery page when remainingCount is 1", () => {
    const { getByText } = render(<CieWrongPin remainingCount={1} />);

    expect(
      getByText(I18n.t("authentication.cie.pin.incorrectCiePinTitle2"))
    ).toBeTruthy();

    fireEvent.press(
      getByText(
        I18n.t("authentication.cie.pin.incorrectCiePinSecondaryActionLabel2")
      )
    );
    expect(Linking.openURL).toHaveBeenCalledWith(
      "https://www.cartaidentita.interno.gov.it/info-utili/codici-di-sicurezza-pin-e-puk/"
    );

    fireEvent.press(getByText(I18n.t("global.buttons.retry")));
    expect(mockNavigate).toHaveBeenCalledWith("AUTHENTICATION", {
      screen: "CIE_PIN_SCREEN"
    });
  });

  it("should render the first-attempt content with retry and close actions when remainingCount is 2", () => {
    const { getByText } = render(<CieWrongPin remainingCount={2} />);

    expect(
      getByText(I18n.t("authentication.cie.pin.incorrectCiePinTitle1"))
    ).toBeTruthy();

    fireEvent.press(getByText(I18n.t("global.buttons.retry")));
    expect(mockNavigate).toHaveBeenCalledWith("AUTHENTICATION", {
      screen: "CIE_PIN_SCREEN"
    });

    fireEvent.press(getByText(I18n.t("global.buttons.close")));
    expect(mockNavigateToAuthenticationScreen).toHaveBeenCalled();
  });

  it("should render a generic error for any other remainingCount value", () => {
    const { getByText } = render(<CieWrongPin remainingCount={7} />);

    expect(getByText(I18n.t("global.genericError"))).toBeTruthy();
    expect(getByText("7")).toBeTruthy();
  });
});

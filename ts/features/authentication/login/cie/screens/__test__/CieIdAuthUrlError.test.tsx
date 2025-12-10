import { fireEvent, render } from "@testing-library/react-native";
import i18n from "i18next";
import * as analytics from "../../analytics";
import CieIdAuthUrlError from "../CieIdAuthUrlError";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockUrl = "https://unauthorized-url.com";

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useRoute: () => ({
    params: {
      url: mockUrl
    }
  }),
  useNavigation: () => ({
    navigate: mockNavigate,
    replace: mockReplace
  })
}));

jest.mock("../../analytics");

jest.mock("../../../../../../store/hooks", () => ({
  useIODispatch: jest.fn(),
  useIOStore: jest.fn(),
  useIOSelector: jest.fn()
}));

describe("CieIdAuthUrlError", () => {
  it("Should match the snapshot", () => {
    const component = render(<CieIdAuthUrlError />);
    expect(component).toMatchSnapshot();
  });

  it("Should call trackCieIdNoWhitelistUrl on first render", () => {
    render(<CieIdAuthUrlError />);
    expect(analytics.trackCieIdNoWhitelistUrl).toHaveBeenCalledWith(
      mockUrl,
      "auth"
    );
  });

  it("Should render the correct title and subtitle", () => {
    const { getByText } = render(<CieIdAuthUrlError />);

    expect(
      getByText(i18n.t("authentication.cieidUrlErrorScreen.title"))
    ).toBeTruthy();
    expect(
      getByText(i18n.t("authentication.cieidUrlErrorScreen.description"))
    ).toBeTruthy();
  });

  it("Should call navigate to AUTHENTICATION_LANDING when close button is pressed", () => {
    const { getByText } = render(<CieIdAuthUrlError />);

    const closeButton = getByText(i18n.t("global.buttons.close"));
    fireEvent.press(closeButton);

    expect(mockReplace).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.LANDING
    });
  });
});

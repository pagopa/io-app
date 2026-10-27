import { fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";
import { ComponentProps } from "react";

import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import * as analytics from "../../analytics";
import CieIdAuthUrlErrorScreen from "../CieIdAuthUrlError";

const mockPopTo = jest.fn();
const mockUrl = "https://unauthorized-url.com";

jest.mock("../../analytics");

const mockUseDebugInfo = jest.fn();
jest.mock("../../../../../../hooks/useDebugInfo", () => ({
  useDebugInfo: (data: unknown) => mockUseDebugInfo(data)
}));

jest.mock("../../../../../../store/hooks", () => ({
  useIODispatch: jest.fn(),
  useIOStore: jest.fn(),
  useIOSelector: jest.fn()
}));

const screenProps = {
  navigation: { popTo: mockPopTo },
  route: { params: { url: mockUrl } }
} as unknown as ComponentProps<typeof CieIdAuthUrlErrorScreen>;

describe("CieIdAuthUrlError", () => {
  it("Should match the snapshot", () => {
    const component = render(<CieIdAuthUrlErrorScreen {...screenProps} />);
    expect(component).toMatchSnapshot();
  });

  it("Should call trackCieIdNoWhitelistUrl on first render", () => {
    render(<CieIdAuthUrlErrorScreen {...screenProps} />);
    expect(analytics.trackCieIdNoWhitelistUrl).toHaveBeenCalledWith(
      mockUrl,
      "auth"
    );
  });

  it("Should set the not allowed URL and the login flow as debug data", () => {
    render(<CieIdAuthUrlErrorScreen {...screenProps} />);
    expect(mockUseDebugInfo).toHaveBeenLastCalledWith({
      notAllowedUrl: mockUrl,
      flow: "auth"
    });
  });

  it("Should render the correct title and subtitle", () => {
    const { getByText } = render(<CieIdAuthUrlErrorScreen {...screenProps} />);

    expect(
      getByText(I18n.t("authentication.cieidUrlErrorScreen.title"))
    ).toBeTruthy();
    expect(
      getByText(I18n.t("authentication.cieidUrlErrorScreen.description"))
    ).toBeTruthy();
  });

  it("Should pop to AUTHENTICATION_LANDING when close button is pressed", () => {
    const { getByText } = render(<CieIdAuthUrlErrorScreen {...screenProps} />);

    const closeButton = getByText(I18n.t("global.buttons.close"));
    fireEvent.press(closeButton);

    expect(mockPopTo).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.LANDING);
  });
});

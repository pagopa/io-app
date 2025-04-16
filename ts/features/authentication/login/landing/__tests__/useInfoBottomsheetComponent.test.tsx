import { render, fireEvent } from "@testing-library/react-native";
import * as urlUtils from "../../../../../utils/url";
import I18n from "../../../../../i18n";
import { useIOSelector } from "../../../../../store/hooks";
import { useInfoBottomsheetComponent } from "../hooks/useInfoBottomsheetComponent";

jest.mock("../../../../../store/hooks", () => ({
  useIOSelector: jest.fn()
}));

jest.mock("../../../../../utils/url", () => ({
  openWebUrl: jest.fn()
}));

jest.mock("../../../../../utils/hooks/bottomSheet", () => ({
  useIOBottomSheetModal: jest.fn(options => ({
    present: mockPresent,
    dismiss: mockDismiss,
    bottomSheet: <>{options.component}</>
  }))
}));

const mockPresent = jest.fn();
const mockDismiss = jest.fn();

describe("useInfoBottomsheetComponent", () => {
  const mockPrivacyUrl = "https://example.com/privacy";

  beforeEach(() => {
    jest.clearAllMocks();
    (useIOSelector as jest.Mock).mockReturnValue({ tos_url: mockPrivacyUrl });
  });

  const renderComponent = () => {
    const WrapperComponent = () => {
      const { infoBottomsheetComponent } = useInfoBottomsheetComponent();
      return <>{infoBottomsheetComponent}</>;
    };
    return render(<WrapperComponent />);
  };

  it("should render bottom sheet with all items", () => {
    const { getByText } = renderComponent();

    expect(
      getByText(
        I18n.t(
          "authentication.landing.useful_resources.bottomSheet.privacy_policy"
        )
      )
    ).toBeTruthy();
    expect(
      getByText(
        I18n.t(
          "authentication.landing.useful_resources.bottomSheet.manage_access"
        )
      )
    ).toBeTruthy();
    expect(
      getByText(
        I18n.t(
          "authentication.landing.useful_resources.bottomSheet.io_more_informations"
        )
      )
    ).toBeTruthy();
  });

  it("should call openWebUrl with privacyUrl when privacy policy is pressed", () => {
    const { getByText } = renderComponent();

    fireEvent.press(
      getByText(
        I18n.t(
          "authentication.landing.useful_resources.bottomSheet.privacy_policy"
        )
      )
    );

    expect(urlUtils.openWebUrl).toHaveBeenCalledWith(mockPrivacyUrl);
  });

  it("should call openWebUrl with fixed URL for manage access", () => {
    const { getByText } = renderComponent();

    fireEvent.press(
      getByText(
        I18n.t(
          "authentication.landing.useful_resources.bottomSheet.manage_access"
        )
      )
    );

    expect(urlUtils.openWebUrl).toHaveBeenCalledWith(
      "https://ioapp.it/esci-da-io"
    );
  });

  it("should call openWebUrl with fixed URL for IO showcase", () => {
    const { getByText } = renderComponent();

    fireEvent.press(
      getByText(
        I18n.t(
          "authentication.landing.useful_resources.bottomSheet.io_more_informations"
        )
      )
    );

    expect(urlUtils.openWebUrl).toHaveBeenCalledWith("https://ioapp.it");
  });

  it("should increment tap counter on each tap and reset after 5", () => {
    const { getByTestId } = renderComponent();
    const appVersion = getByTestId("app-version-button");

    // eslint-disable-next-line functional/no-let
    for (let i = 0; i < 6; i++) {
      fireEvent.press(appVersion);
    }

    expect(appVersion).toBeTruthy();
  });
});

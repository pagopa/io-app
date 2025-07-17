import { fireEvent } from "@testing-library/react-native";
import * as URLUTILS from "../../../../../utils/url";
import { renderComponent } from "../../../../settings/common/components/__tests__/ProfileMainScreenTopBanner.test";
import { SendQrScanRedirectScreen } from "../SendQrScanRedirectScreen";
import * as IONAV from "../../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../../navigation/routes";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";

type navType = ReturnType<(typeof IONAV)["useIONavigation"]>;

describe("SendQrScanRedirectScreen", () => {
  const mockOpenWebUrl = jest.fn();
  const mockNavigate = jest.fn() as navType["navigate"];
  beforeAll(() => {
    jest.spyOn(URLUTILS, "openWebUrl").mockImplementation(mockOpenWebUrl);
    jest
      .spyOn(IONAV, "useIONavigation")
      .mockImplementation(() => ({ navigate: mockNavigate } as navType));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const aarUrl = "https://example.com";
  const renderScreen = () =>
    renderComponent(<SendQrScanRedirectScreen aarUrl={aarUrl} />);

  it("should match snapshot", () => {
    const { toJSON } = renderScreen();
    expect(toJSON()).toMatchSnapshot();
  });

  it("calls openWebUrl with aarUrl when primary action is pressed", () => {
    const { getByTestId } = renderScreen();
    const button = getByTestId("primary-action"); // the function should not have been called before the button press
    expect(mockOpenWebUrl).toHaveBeenCalledTimes(0);
    fireEvent(button, "press");
    expect(mockOpenWebUrl).toHaveBeenCalledWith(aarUrl);
    expect(mockOpenWebUrl).toHaveBeenCalledTimes(1);
  });

  it("calls navigation.navigate when secondary action is pressed", () => {
    const { getByTestId } = renderScreen();
    const button = getByTestId("secondary-action");
    fireEvent(button, "press");
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.MAIN, {
      screen: MESSAGES_ROUTES.MESSAGES_HOME
    });
  });
});

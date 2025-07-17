import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import * as IONAV from "../../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as URLUTILS from "../../../../../utils/url";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import { PN_QR_SCAN_ROUTES } from "../../navigation/navigator";
import { SendQrScanRedirectScreen } from "../SendQrScanRedirectScreen";

type navType = ReturnType<(typeof IONAV)["useIONavigation"]>;

const aarUrl = "https://example.com";

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

  it("should match snapshot", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });

  it("calls openWebUrl with aarUrl when primary action is pressed", () => {
    const { getByTestId } = renderComponent();
    const button = getByTestId("primary-action"); // the function should not have been called before the button press
    expect(mockOpenWebUrl).toHaveBeenCalledTimes(0);
    fireEvent(button, "press");
    expect(mockOpenWebUrl).toHaveBeenCalledWith(aarUrl);
    expect(mockOpenWebUrl).toHaveBeenCalledTimes(1);
  });

  it("calls navigation.navigate when secondary action is pressed", () => {
    const { getByTestId } = renderComponent();
    const button = getByTestId("secondary-action");
    fireEvent(button, "press");
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.MAIN, {
      screen: MESSAGES_ROUTES.MESSAGES_HOME
    });
  });
});
function renderComponent() {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <SendQrScanRedirectScreen aarUrl={aarUrl} />,
    PN_QR_SCAN_ROUTES.QR_SCAN_FLOW,
    {},
    createStore(appReducer, globalState as any)
  );
}

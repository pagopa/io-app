import { act, fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as URLUTILS from "../../../../../utils/url";
import { SendQRScanRedirectComponent } from "../SendQRScanRedirectComponent";
import PN_ROUTES from "../../../navigation/routes";

const aarUrl = "https://example.com";

const mockPopToTop = jest.fn();
jest.mock("@react-navigation/native", () => {
  const navigationModule = jest.requireActual("@react-navigation/native");
  return {
    ...navigationModule,
    useNavigation: () => ({
      ...navigationModule.useNavigation(),
      popToTop: mockPopToTop
    })
  };
});

jest.mock("react-native-haptic-feedback", () => ({
  trigger: jest.fn()
}));

describe("SendQRScanRedirectComponent", () => {
  const mockOpenWebUrl = jest.fn();
  beforeAll(() => {
    jest.spyOn(URLUTILS, "openWebUrl").mockImplementation(mockOpenWebUrl);
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
    const button = getByTestId("primary-action");
    expect(mockOpenWebUrl).toHaveBeenCalledTimes(0); // the function should not have been called before the button press
    fireEvent(button, "press");
    expect(mockOpenWebUrl).toHaveBeenCalledWith(aarUrl);
    expect(mockOpenWebUrl).toHaveBeenCalledTimes(1);
  });
  it("calls popToTop when the header action is pressed", () => {
    const { getByTestId } = renderComponent();
    const header = getByTestId("header-close");
    fireEvent(header, "press");
    expect(mockOpenWebUrl).toHaveBeenCalledTimes(0);
    expect(mockPopToTop.mock.calls.length).toBe(1);
    expect(mockPopToTop.mock.calls[0].length).toBe(0);
  });
});
function renderComponent() {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <SendQRScanRedirectComponent aarUrl={aarUrl} />,
    PN_ROUTES.QR_SCAN_FLOW,
    {},
    createStore(appReducer, globalState as any)
  );
}

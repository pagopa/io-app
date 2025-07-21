import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as URLUTILS from "../../../../../utils/url";
import { SendQrScanRedirectComponent } from "../SendQrScanRedirectComponent";
import PN_ROUTES from "../../../navigation/routes";

const aarUrl = "https://example.com";

describe("SendQrScanRedirectComponent", () => {
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
    const button = getByTestId("primary-action"); // the function should not have been called before the button press
    expect(mockOpenWebUrl).toHaveBeenCalledTimes(0);
    fireEvent.press(button);
    expect(mockOpenWebUrl).toHaveBeenCalledWith(aarUrl);
    expect(mockOpenWebUrl).toHaveBeenCalledTimes(1);
  });
});
function renderComponent() {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <SendQrScanRedirectComponent aarUrl={aarUrl} />,
    PN_ROUTES.QR_SCAN_FLOW,
    {},
    createStore(appReducer, globalState as any)
  );
}

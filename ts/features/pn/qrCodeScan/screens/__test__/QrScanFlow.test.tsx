import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as REDIRECT_SCREEN from "../../components/SendQrScanRedirectScreen";
import { PN_QR_SCAN_ROUTES } from "../../navigation/navigator";
import { SendQrScanFlow } from "../QrScanFlow";

describe("SendQrScanFlow", () => {
  const mockAarUrl = "https://test-url.com";
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders SendQrScanRedirectScreen with aarUrl from route params", () => {
    const mockComponent = jest.fn();
    jest
      .spyOn(REDIRECT_SCREEN, "SendQrScanRedirectScreen")
      .mockImplementation(({ aarUrl }) => {
        mockComponent(aarUrl);
        return <></>;
      });
    renderComponent(mockAarUrl);
    expect(mockComponent).toHaveBeenCalledWith(mockAarUrl);
    expect(mockComponent).toHaveBeenCalledTimes(1);
  });
});
function renderComponent(aarUrl: string) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <SendQrScanFlow />,
    PN_QR_SCAN_ROUTES.QR_SCAN_FLOW,
    { aarUrl },
    createStore(appReducer, globalState as any)
  );
}

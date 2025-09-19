import * as O from "fp-ts/lib/Option";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { SendQRScanFlowScreen } from "../SendQRScanFlowScreen";
import PN_ROUTES from "../../../navigation/routes";
import * as device from "../../../../../utils/device";

jest.mock("../../components/SendQRScanFlowHandlerComponent");

describe("SendQRScanFlowScreen", () => {
  const mockAarUrl = "https://test-url.com";
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should match snapshot when no app update is required", () => {
    jest
      .spyOn(device, "getDeviceAppVersion")
      .mockImplementation(() => "2.0.0.0");
    const screen = renderScreen(mockAarUrl);
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when an app update is required", () => {
    jest
      .spyOn(device, "getDeviceAppVersion")
      .mockImplementation(() => "1.0.0.0");
    const screen = renderScreen(mockAarUrl);
    expect(screen.toJSON()).toMatchSnapshot();
  });
});

const renderScreen = (aarUrl: string) => {
  const baseState = appReducer(undefined, applicationChangeState("active"));
  const globalState = {
    ...baseState,
    remoteConfig: O.some({
      assistanceTool: {
        tool: "zendesk"
      },
      cgn: {
        enabled: false
      },
      pn: {
        min_app_version: {
          ios: "1.5.0.0",
          android: "1.5.0.0"
        }
      }
    })
  } as GlobalState;
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <SendQRScanFlowScreen />,
    PN_ROUTES.QR_SCAN_FLOW,
    { aarUrl },
    createStore(appReducer, globalState as any)
  );
};

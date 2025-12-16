import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import * as HOOKS from "../../../../../store/hooks";
import { appReducer } from "../../../../../store/reducers";
import * as REMOTE_CONFIG from "../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as URL_UTILS from "../../../../../utils/url";
import PN_ROUTES from "../../../navigation/routes";
import * as FLOW_MANAGER from "../../hooks/useSendAarFlowManager";
import * as SELECTORS from "../../store/selectors";
import { sendAARFlowStates } from "../../utils/stateUtils";
import { SendAARTosComponent } from "../SendAARTosComponent";
import * as ANALYTICS from "../../analytics";

const qrCodeMock = "TEST";
const mockPrivacyUrls = {
  tos: "TOS_URL",
  privacy: "PRIV_URL"
};

const privacyUrlSpy = jest.spyOn(REMOTE_CONFIG, "pnPrivacyUrlsSelector");
const flowDataSpy = jest.spyOn(SELECTORS, "currentAARFlowData");
const managerSpy = jest.spyOn(FLOW_MANAGER, "useSendAarFlowManager");
describe("SendAARTosComponent", () => {
  const mockGoNextState = jest.fn();
  const mockTerminateFlow = jest.fn();
  const mockDispatch = jest.fn();
  const mockOpenWebUrl = jest
    .spyOn(URL_UTILS, "openWebUrl")
    .mockImplementation();

  beforeAll(() => {
    jest.spyOn(HOOKS, "useIODispatch").mockImplementation(() => mockDispatch);
    privacyUrlSpy.mockImplementation(() => mockPrivacyUrls);
    managerSpy.mockImplementation(() => ({
      currentFlowData: { type: "none" },
      goToNextState: mockGoNextState,
      terminateFlow: mockTerminateFlow
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("goes to the next state when the button is pressed", () => {
    const { getByTestId } = renderComponent(qrCodeMock);
    const button = getByTestId("primary_button");
    expect(mockGoNextState).toHaveBeenCalledTimes(0);
    fireEvent.press(button);
    expect(mockGoNextState).toHaveBeenCalledTimes(1);
  });
  it("quits out of the flow on secondary button press and call 'trackSendAARToSDismissed' ", () => {
    const spiedOnMockedTrackSendAARToSDismissed = jest
      .spyOn(ANALYTICS, "trackSendAARToSDismissed")
      .mockImplementation();

    const { getByTestId } = renderComponent(qrCodeMock);

    const button = getByTestId("secondary_button");
    expect(mockTerminateFlow).toHaveBeenCalledTimes(0);
    fireEvent.press(button);
    expect(mockTerminateFlow).toHaveBeenCalledTimes(1);
    expect(spiedOnMockedTrackSendAARToSDismissed.mock.calls.length).toBe(1);
    expect(spiedOnMockedTrackSendAARToSDismissed.mock.calls[0].length).toBe(0);
  });
  it("should match snapshot", () => {
    const { toJSON } = renderComponent(qrCodeMock);
    expect(toJSON()).toMatchSnapshot();
  });
  (["privacy", "tos"] as const).forEach(testId => {
    it(`should open the ${testId} url on press`, () => {
      const { getByTestId } = renderComponent(qrCodeMock);
      const link = getByTestId(testId);
      expect(mockOpenWebUrl).toHaveBeenCalledTimes(0);
      fireEvent(link, "press");

      expect(mockOpenWebUrl).toHaveBeenCalledTimes(1);
      expect(mockOpenWebUrl).toHaveBeenCalledWith(mockPrivacyUrls[testId]);
    });
  });
});

const renderComponent = (qr: string, isRightState = true) => {
  flowDataSpy.mockImplementation(() => ({
    type: isRightState
      ? sendAARFlowStates.displayingAARToS
      : sendAARFlowStates.fetchingQRData,
    qrCode: qr
  }));
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <SendAARTosComponent />,
    PN_ROUTES.QR_SCAN_FLOW,
    {},
    createStore(appReducer, globalState as any)
  );
};

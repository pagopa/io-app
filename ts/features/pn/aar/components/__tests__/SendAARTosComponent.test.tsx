import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import * as APP_PARAMS from "../../../../../navigation/params/AppParamsList";
import * as APP_PARAMS from "../../../../../navigation/params/AppParamsList";
import { applicationChangeState } from "../../../../../store/actions/application";
import * as HOOKS from "../../../../../store/hooks";
import * as HOOKS from "../../../../../store/hooks";
import { appReducer } from "../../../../../store/reducers";
import * as REMOTE_CONFIG from "../../../../../store/reducers/backendStatus/remoteConfig";
import * as REMOTE_CONFIG from "../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as URL_UTILS from "../../../../../utils/url";
import * as URL_UTILS from "../../../../../utils/url";
import PN_ROUTES from "../../../navigation/routes";
import { setAarFlowState } from "../../store/actions";
import * as REDUCER from "../../store/reducers";
import { SendAARTosComponent } from "../SendAARTosComponent";

const qrCodeMock = "TEST";
const mockPrivacyUrls = {
  tos: "TOS_URL",
  privacy: "PRIV_URL"
};

const privacyUrlSpy = jest.spyOn(REMOTE_CONFIG, "pnPrivacyUrlsSelector");
const flowDataSpy = jest.spyOn(REDUCER, "currentAARFlowData");
const { sendAARFlowStates } = REDUCER;
describe("SendAARTosComponent", () => {
  const mockDispatch = jest.fn();
  const mockOpenWebUrl = jest
    .spyOn(URL_UTILS, "openWebUrl")
    .mockImplementation();

  beforeAll(() => {
    jest.spyOn(HOOKS, "useIODispatch").mockImplementation(() => mockDispatch);
    privacyUrlSpy.mockImplementation(() => mockPrivacyUrls);
  });
  afterEach(() => {
  const mockOpenWebUrl = jest
    .spyOn(URL_UTILS, "openWebUrl")
    .mockImplementation();

  beforeAll(() => {
    jest.spyOn(HOOKS, "useIODispatch").mockImplementation(() => mockDispatch);
    privacyUrlSpy.mockImplementation(() => mockPrivacyUrls);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("dispatches the correct action when the button is pressed", () => {
    const { getByTestId } = renderComponent(qrCodeMock);
    const button = getByTestId("primary_button");
    const button = getByTestId("primary_button");
    fireEvent.press(button);

    expect(mockDispatch).toHaveBeenCalledWith(
      setAarFlowState({
        type: sendAARFlowStates.fetchingQRData,
        qrCode: qrCodeMock
      })
    );
  });
  it("quits out of the flow on secondary button press", () => {
    const mockPopToTop = jest.fn();
    jest.spyOn(APP_PARAMS, "useIONavigation").mockImplementation(
      () =>
        ({
          popToTop: mockPopToTop
        } as unknown as ReturnType<typeof APP_PARAMS.useIONavigation>)
    );
    const { getByTestId } = renderComponent(qrCodeMock);
    const button = getByTestId("secondary_button");
    expect(mockPopToTop).not.toHaveBeenCalled();
    fireEvent.press(button);
    expect(mockPopToTop).toHaveBeenCalledTimes(1);
  });
  it("quits out of the flow on secondary button press", () => {
    const mockPopToTop = jest.fn();
    jest.spyOn(APP_PARAMS, "useIONavigation").mockImplementation(
      () =>
        ({
          popToTop: mockPopToTop
        } as unknown as ReturnType<typeof APP_PARAMS.useIONavigation>)
    );
    const { getByTestId } = renderComponent(qrCodeMock);
    const button = getByTestId("secondary_button");
    expect(mockPopToTop).not.toHaveBeenCalled();
    fireEvent.press(button);
    expect(mockPopToTop).toHaveBeenCalledTimes(1);
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
  it("should go into a ko state if navigated to with an invalid aar state", () => {
    expect(mockDispatch).toHaveBeenCalledTimes(0);
    renderComponent(qrCodeMock, false);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      setAarFlowState({
        type: sendAARFlowStates.ko,
        previousState: {
          type: sendAARFlowStates.fetchingQRData,
          qrCode: qrCodeMock
        }
      })
    );
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

import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import PN_ROUTES from "../../../../navigation/routes";
import { SendAarNfcNotSupportedComponent } from "../SendAarNfcNotSupportedComponent";
import * as FLOW_MANAGER from "../../../hooks/useSendAarFlowManager";
import * as IO_NAV from "../../../../../../navigation/params/AppParamsList";
import * as URL_UTILS from "../../../../../../utils/url";
import {
  trackSendAarNotificationOpeningNfcNotSupported,
  trackSendAarNotificationOpeningNfcNotSupportedClosure,
  trackSendAarNotificationOpeningNfcNotSupportedInfo
} from "../../../analytics";

const terminateFlowMock = jest.fn();
const setOptionsMock = jest.fn();

jest.mock("../../../analytics", () => ({
  trackSendAarNotificationOpeningNfcNotSupported: jest.fn(),
  trackSendAarNotificationOpeningNfcNotSupportedClosure: jest.fn(),
  trackSendAarNotificationOpeningNfcNotSupportedInfo: jest.fn()
}));

describe("SendAarNfcNotSupportedComponent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should match the snapshot", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });

  it("calls setOptions to show header on mount", () => {
    jest.spyOn(IO_NAV, "useIONavigation").mockImplementation(
      () =>
        ({
          setOptions: setOptionsMock
        } as unknown as ReturnType<typeof IO_NAV.useIONavigation>)
    );
    renderComponent();
    expect(setOptionsMock).toHaveBeenCalledWith({ headerShown: true });
  });

  it('should call "trackSendAarNotificationOpeningNfcNotSupported" on component mount', () => {
    renderComponent();

    expect(
      trackSendAarNotificationOpeningNfcNotSupported
    ).toHaveBeenCalledTimes(1);
  });

  it('calls terminateFlow and "trackSendAarNotificationOpeningNfcNotSupportedClosure" when close icon is pressed', () => {
    jest.spyOn(FLOW_MANAGER, "useSendAarFlowManager").mockImplementation(
      () =>
        ({
          terminateFlow: terminateFlowMock
        } as unknown as ReturnType<typeof FLOW_MANAGER.useSendAarFlowManager>)
    );
    const { getByTestId } = renderComponent();
    const closeButton = getByTestId("close-x");

    expect(terminateFlowMock).toHaveBeenCalledTimes(0);
    expect(
      trackSendAarNotificationOpeningNfcNotSupportedClosure
    ).toHaveBeenCalledTimes(0);

    fireEvent.press(closeButton);

    expect(terminateFlowMock).toHaveBeenCalledTimes(1);
    expect(
      trackSendAarNotificationOpeningNfcNotSupportedClosure
    ).toHaveBeenCalledTimes(1);
  });
  it('opens help center url and calls "trackSendAarNotificationOpeningNfcNotSupportedInfo" when help center cta is pressed', () => {
    const webUrlSpy = jest.spyOn(URL_UTILS, "openWebUrl");
    const { getByTestId } = renderComponent();
    const helpCenterCta = getByTestId("help-center-cta");

    expect(webUrlSpy).toHaveBeenCalledTimes(0);
    expect(
      trackSendAarNotificationOpeningNfcNotSupportedInfo
    ).toHaveBeenCalledTimes(0);

    fireEvent.press(helpCenterCta);

    expect(webUrlSpy).toHaveBeenCalledTimes(1);
    expect(
      trackSendAarNotificationOpeningNfcNotSupportedInfo
    ).toHaveBeenCalledTimes(1);
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <SendAarNfcNotSupportedComponent />,
    PN_ROUTES.QR_SCAN_FLOW,
    {},
    store
  );
};

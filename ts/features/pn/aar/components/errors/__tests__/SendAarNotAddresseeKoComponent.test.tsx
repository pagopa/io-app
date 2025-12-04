import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as URL_UTILS from "../../../../../../utils/url";
import PN_ROUTES from "../../../../navigation/routes";
import * as FLOW_MANAGER from "../../../hooks/useSendAarFlowManager";
import * as SELECTORS from "../../../../../../store/reducers/backendStatus/remoteConfig";
import * as ANALYTICS from "../../../analytics";
import { SendAarNotAddresseeKoComponent } from "../SendAarNotAddresseeKoComponent";

const managerSpy = jest.spyOn(FLOW_MANAGER, "useSendAarFlowManager");
const mockOpenWebUrl = jest.spyOn(URL_UTILS, "openWebUrl").mockImplementation();
const mockDelegateUrl = "https://www.test.io";

describe("SendAARTosComponent", () => {
  const mockGoNextState = jest.fn();
  const mockTerminateFlow = jest.fn();

  beforeAll(() => {
    managerSpy.mockImplementation(() => ({
      currentFlowData: { type: "none" },
      goToNextState: mockGoNextState,
      terminateFlow: mockTerminateFlow
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("goes to open url when the button is pressed and calls trackSendAARAccessDeniedDelegateInfo", () => {
    jest
      .spyOn(SELECTORS, "sendAARDelegateUrlSelector")
      .mockImplementation(_state => mockDelegateUrl);
    const spiedOnMockedTrackSendAARAccessDeniedDelegateInfo = jest
      .spyOn(ANALYTICS, "trackSendAARAccessDeniedDelegateInfo")
      .mockImplementation();

    const { getByTestId } = renderComponent();

    const button = getByTestId("primary_button");
    expect(mockOpenWebUrl).toHaveBeenCalledTimes(0);
    fireEvent.press(button);

    expect(mockOpenWebUrl).toHaveBeenCalledTimes(1);
    expect(mockOpenWebUrl).toHaveBeenCalledWith(mockDelegateUrl);

    expect(
      spiedOnMockedTrackSendAARAccessDeniedDelegateInfo.mock.calls.length
    ).toBe(1);
    expect(
      spiedOnMockedTrackSendAARAccessDeniedDelegateInfo.mock.calls[0].length
    ).toBe(0);
  });
  it("quits out of the flow on secondary button press and calls trackSendAARAccessDeniedDismissed", () => {
    const spiedOnMockedTrackSendAARAccessDeniedDismissed = jest
      .spyOn(ANALYTICS, "trackSendAARAccessDeniedDismissed")
      .mockImplementation();

    const { getByTestId } = renderComponent();

    const button = getByTestId("secondary_button");
    expect(mockTerminateFlow).toHaveBeenCalledTimes(0);
    fireEvent.press(button);
    expect(mockTerminateFlow).toHaveBeenCalledTimes(1);

    expect(
      spiedOnMockedTrackSendAARAccessDeniedDismissed.mock.calls.length
    ).toBe(1);
    expect(
      spiedOnMockedTrackSendAARAccessDeniedDismissed.mock.calls[0].length
    ).toBe(0);
  });
  it("should match snapshot", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <SendAarNotAddresseeKoComponent />,
    PN_ROUTES.QR_SCAN_FLOW,
    {},
    createStore(appReducer, globalState as any)
  );
};

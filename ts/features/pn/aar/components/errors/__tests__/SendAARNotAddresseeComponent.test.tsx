import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../../store/actions/application";
import * as HOOKS from "../../../../../../store/hooks";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as URL_UTILS from "../../../../../../utils/url";
import PN_ROUTES from "../../../../navigation/routes";
import * as FLOW_MANAGER from "../../../hooks/useSendAarFlowManager";
import { SendAARNotAddresseeComponent } from "../SendAARNotAddresseeComponent";

const managerSpy = jest.spyOn(FLOW_MANAGER, "useSendAarFlowManager");
const mockOpenWebUrl = jest.spyOn(URL_UTILS, "openWebUrl").mockImplementation();
const mockDelegateUrl = "https://www.test.io";

jest.mock("../../../../../../store/hooks", () => ({
  ...jest.requireActual("../../../../../../store/hooks"),
  useIOSelector: jest.fn()
}));

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

  it("goes to open url when the button is pressed", () => {
    (HOOKS.useIOSelector as jest.Mock).mockReturnValue(mockDelegateUrl);
    const { getByTestId } = renderComponent();
    const button = getByTestId("primary_button");
    expect(mockOpenWebUrl).toHaveBeenCalledTimes(0);
    fireEvent.press(button);
    expect(mockOpenWebUrl).toHaveBeenCalledTimes(1);
    expect(mockOpenWebUrl).toHaveBeenCalledWith(mockDelegateUrl);
  });
  it("quits out of the flow on secondary button press", () => {
    const { getByTestId } = renderComponent();
    const button = getByTestId("secondary_button");
    expect(mockTerminateFlow).toHaveBeenCalledTimes(0);
    fireEvent.press(button);
    expect(mockTerminateFlow).toHaveBeenCalledTimes(1);
  });
  it("should match snapshot", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <SendAARNotAddresseeComponent />,
    PN_ROUTES.QR_SCAN_FLOW,
    {},
    createStore(appReducer, globalState as any)
  );
};

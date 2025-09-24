import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../../store/actions/application";
import * as HOOKS from "../../../../../../store/hooks";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import PN_ROUTES from "../../../../navigation/routes";
import * as FLOW_MANAGER from "../../../hooks/useSendAarFlowManager";
import { SendAARNotAddresseeComponent } from "../SendAARNotAddresseeComponent";

const managerSpy = jest.spyOn(FLOW_MANAGER, "useSendAarFlowManager");
describe("SendAARTosComponent", () => {
  const mockGoNextState = jest.fn();
  const mockTerminateFlow = jest.fn();
  const mockDispatch = jest.fn();

  beforeAll(() => {
    jest.spyOn(HOOKS, "useIODispatch").mockImplementation(() => mockDispatch);
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
    const { getByTestId } = renderComponent();
    const button = getByTestId("primary_button");
    expect(mockGoNextState).toHaveBeenCalledTimes(0);
    fireEvent.press(button);
    expect(mockGoNextState).toHaveBeenCalledTimes(1);
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

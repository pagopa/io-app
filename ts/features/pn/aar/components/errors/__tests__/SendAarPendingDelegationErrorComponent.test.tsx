import { act, fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import PN_ROUTES from "../../../../navigation/routes";
import * as FLOW_MANAGER from "../../../hooks/useSendAarFlowManager";
import { SendAarPendingDelegationErrorComponent } from "../SendAarPendingDelegationErrorComponent";

describe("SendAarPendingDelegationErrorComponent", () => {
  it("should match snapshot", () => {
    const { toJSON } = renderComponent();
    const expected = toJSON();
    expect(expected).toMatchSnapshot();
  });
  it("should terminate the flow on button press", () => {
    const mockTerminateFlow = jest.fn();
    jest
      .spyOn(FLOW_MANAGER, "useSendAarFlowManager")
      .mockImplementation(() => ({
        currentFlowData: { type: "none" },
        goToNextState: jest.fn(),
        terminateFlow: mockTerminateFlow
      }));
    const { getByTestId } = renderComponent();
    const button = getByTestId("PendingDelegationCloseButton");
    expect(mockTerminateFlow).not.toHaveBeenCalled();
    act(() => {
      fireEvent.press(button);
    });
    expect(mockTerminateFlow).toHaveBeenCalled();
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <SendAarPendingDelegationErrorComponent />,
    PN_ROUTES.SEND_AAR_ERROR,
    {},
    createStore(appReducer, globalState as any)
  );
};

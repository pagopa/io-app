import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { useIODispatch } from "../../../../../../store/hooks";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import CGN_ROUTES from "../../../navigation/routes";
import { cgnActivationComplete } from "../../../store/actions/activation"; // import actual actions
import CgnActivationCompletedScreen from "../CgnActivationCompletedScreen";

jest.mock("../../../../../../store/hooks", () => ({
  useIODispatch: jest.fn(),
  useIOStore: jest.fn(),
  useIOSelector: jest.fn()
}));

const renderComponent = () => {
  const state = appReducer(undefined, applicationChangeState("active"));

  return renderScreenWithNavigationStoreContext<GlobalState>(
    CgnActivationCompletedScreen,
    CGN_ROUTES.ACTIVATION.COMPLETED,
    {},
    createStore(appReducer, state as any)
  );
};
describe("CgnActivationCompletedScreen", () => {
  it("dispatches cgnActivationComplete when confirm button is pressed", () => {
    const dispatchMock = jest.fn();
    (useIODispatch as jest.Mock).mockReturnValue(dispatchMock);

    const { getByTestId } = renderComponent();
    const button = getByTestId("cgnConfirmButtonTestId");

    fireEvent.press(button);

    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith(cgnActivationComplete());
  });
});

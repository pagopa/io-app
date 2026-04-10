import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import I18n from "i18next";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { useIODispatch } from "../../../../../../store/hooks";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import CGN_ROUTES from "../../../navigation/routes";
import { cgnActivationCancel } from "../../../store/actions/activation";
import CgnActivationPendingScreen from "../CgnActivationPendingScreen";

// Mock useIODispatch hook
jest.mock("../../../../../../store/hooks", () => ({
  useIODispatch: jest.fn(),
  useIOStore: jest.fn(),
  useIOSelector: jest.fn()
}));

// Utility to render component with store
const renderComponent = () => {
  const state = appReducer(undefined, applicationChangeState("active"));

  return renderScreenWithNavigationStoreContext<GlobalState>(
    CgnActivationPendingScreen,
    CGN_ROUTES.ACTIVATION.PENDING,
    {},
    createStore(appReducer, state as any)
  );
};

describe("CgnActivationPendingScreen", () => {
  it("dispatches cgnActivationCancel when close button is pressed", () => {
    const dispatchMock = jest.fn();
    (useIODispatch as jest.Mock).mockReturnValue(dispatchMock);

    const { getByText } = renderComponent();

    const closeButton = getByText(I18n.t("global.buttons.close"));

    fireEvent.press(closeButton);

    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith(cgnActivationCancel());
  });
});

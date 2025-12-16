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
import CgnAlreadyActiveScreen from "../CgnAlreadyActiveScreen";

jest.mock("../../../../../../store/hooks", () => ({
  useIODispatch: jest.fn(),
  useIOStore: jest.fn(),
  useIOSelector: jest.fn()
}));

const mockNavigation = jest.fn();

jest.mock("../../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => ({
    navigate: mockNavigation
  })
}));

const renderComponent = () => {
  const state = appReducer(undefined, applicationChangeState("active"));

  return renderScreenWithNavigationStoreContext<GlobalState>(
    CgnAlreadyActiveScreen,
    CGN_ROUTES.ACTIVATION.TIMEOUT,
    {},
    createStore(appReducer, state as any)
  );
};

describe("CgnAlreadyActiveScreen", () => {
  it("dispatches navigation and cgnActivationCancel when use card button is pressed", () => {
    const dispatchMock = jest.fn();
    (useIODispatch as jest.Mock).mockReturnValue(dispatchMock);

    const { getByText } = renderComponent();

    const closeButton = getByText(I18n.t("bonus.cgn.cta.goToDetail"));

    fireEvent.press(closeButton);

    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith(cgnActivationCancel());

    expect(mockNavigation).toHaveBeenCalledWith(CGN_ROUTES.DETAILS.MAIN, {
      screen: CGN_ROUTES.DETAILS.DETAILS
    });
  });
});

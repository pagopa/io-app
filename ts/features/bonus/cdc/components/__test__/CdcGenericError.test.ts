import { createStore, Store } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import ROUTES from "../../../../../navigation/routes";
import CdcGenericError from "../CdcGenericError";
import I18n from "../../../../../i18n";

jest.useFakeTimers();

const mockedNavigation = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: actualNav,
      dispatch: jest.fn(),
      getParent: () => ({
        goBack: mockedNavigation
      }),
      addListener: () => jest.fn()
    })
  };
});

describe("CdcGenericError", () => {
  it("Should show the CdcGenericError screen with the title, the body and the button", () => {
    const component = renderComponent();
    expect(component.getByTestId("cdcGenericError")).toBeDefined();
    expect(
      component.getByText(
        I18n.t("bonus.cdc.bonusRequest.bonusRequested.ko.genericError.title")
      )
    ).toBeDefined();
    expect(
      component.getByText(
        I18n.t("bonus.cdc.bonusRequest.bonusRequested.ko.genericError.body")
      )
    ).toBeDefined();

    expect(component.getByTestId("closeButton")).toBeDefined();
  });
  it("when the button is pressed a navigation back should be called", () => {
    const component = renderComponent();
    const button = component.getByTestId("closeButton");
    fireEvent(button, "onPress");
    expect(mockedNavigation).toHaveBeenCalledTimes(1);
  });
});

function renderComponent() {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store: Store<GlobalState> = createStore(appReducer, globalState as any);
  return renderScreenWithNavigationStoreContext<GlobalState>(
    CdcGenericError,
    ROUTES.MAIN,
    {},
    store
  );
}

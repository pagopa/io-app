import { createStore, Store } from "redux";
import { fireEvent, RenderAPI } from "@testing-library/react-native";
import { ReactTestInstance } from "react-test-renderer";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import ROUTES from "../../../../navigation/routes";
import ZendeskPanicMode from "../ZendeskPanicMode";
import * as zendeskAction from "../../store/actions";

jest.useFakeTimers();

describe("the ZendeskPanicMode screen", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  it("should be defined", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const component: RenderAPI = renderComponent(store);
    expect(component.queryByTestId("zendeskPanicMode")).toBeDefined();
  });
  it("should call the zendeskSupportCompleted function when the close button is pressed", () => {
    const zendeskWorkunitCompletedSpy = jest.spyOn(
      zendeskAction,
      "zendeskSupportCompleted"
    );
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const component: RenderAPI = renderComponent(store);
    const closeButton: ReactTestInstance = component.getByTestId("closeButton");
    fireEvent(closeButton, "onPress");
    expect(zendeskWorkunitCompletedSpy).toBeCalled();
  });
});

function renderComponent(store: Store<GlobalState>) {
  return renderScreenWithNavigationStoreContext<GlobalState>(
    ZendeskPanicMode,
    ROUTES.MAIN,
    {},
    store
  );
}

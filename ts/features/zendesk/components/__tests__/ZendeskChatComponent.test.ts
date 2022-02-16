import { NavigationParams } from "react-navigation";
import { createStore, Store } from "redux";
import { fireEvent, RenderAPI } from "@testing-library/react-native";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import ROUTES from "../../../../navigation/routes";
import ZendeskChatComponent from "../ZendeskChatComponent";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import {
  zendeskGetTotalNewResponses,
  zendeskRequestTicketNumber
} from "../../store/actions";
import MockZendesk from "../../../../__mocks__/io-react-native-zendesk";

jest.useFakeTimers();
describe("the ThankYouSuccessComponent screen", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  it("Shouldn't render the ZendeskChatComponent if there isn't previous messages", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const component: RenderAPI = renderComponent(store);

    expect(component.queryByTestId("ZendeskChatComponent")).toBeNull();
  });
  describe("If there is at last one previous messages", () => {
    it("Should render the ZendeskChatComponent", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      const component: RenderAPI = renderComponent(store);
      store.dispatch(zendeskRequestTicketNumber.success(1));

      expect(component.queryByTestId("ZendeskChatComponent")).toBeDefined();
    });
    it("Should call the showSupportTickets when the ZendeskChatComponent is pressed", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      const component: RenderAPI = renderComponent(store);
      store.dispatch(zendeskRequestTicketNumber.success(1));

      fireEvent.press(component.getByTestId("ZendeskChatComponent"));

      expect(MockZendesk.showTickets).toBeCalled();
    });
    it("Should show the badge with the new messages if there is at least one new message", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      const component: RenderAPI = renderComponent(store);
      store.dispatch(zendeskRequestTicketNumber.success(1));
      store.dispatch(zendeskGetTotalNewResponses.success(1));

      expect(component.queryByText("1")).toBeDefined();
    });
  });
});
function renderComponent(store: Store<GlobalState>) {
  return renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    ZendeskChatComponent,
    ROUTES.MAIN,
    {},
    store
  );
}

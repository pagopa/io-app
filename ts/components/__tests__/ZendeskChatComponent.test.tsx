import { NavigationParams } from "react-navigation";
import { createStore, Store } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { appReducer } from "../../store/reducers";
import { applicationChangeState } from "../../store/actions/application";
import { GlobalState } from "../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../utils/testWrapper";
import ROUTES from "../../navigation/routes";
import ZendeskChatComponent from "../ZendeskChatComponent";
import {
  idpSelected,
  loginSuccess,
  sessionInformationLoadSuccess
} from "../../store/actions/authentication";
import { SessionToken } from "../../types/SessionToken";
import { PublicSession } from "../../../definitions/backend/PublicSession";
import { SpidLevelEnum } from "../../../definitions/backend/SpidLevel";
import MockZendesk from "../../__mocks__/io-react-native-zendesk";
import { SpidIdp } from "../../../definitions/content/SpidIdp";

const mockPublicSession: PublicSession = {
  bpdToken: "bpdToken",
  myPortalToken: "myPortalToken",
  spidLevel: SpidLevelEnum["https://www.spid.gov.it/SpidL2"],
  walletToken: "walletToken",
  zendeskToken: "zendeskToken"
};

jest.useFakeTimers();
describe("the ZendeskChatComponent", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  it("should render the zendesk open ticket button", () => {
    const store = createStore(appReducer, globalState as any);
    const component = renderComponent(store);
    expect(component.getByTestId("zendeskOpenTicketButton")).toBeDefined();
  });
  it("should render the zendesk open ticket icon", () => {
    const store = createStore(appReducer, globalState as any);
    const component = renderComponent(store);
    expect(component.getByTestId("zendeskOpenTicketIcon")).toBeDefined();
  });
  it("should render the zendesk show tickets button", () => {
    const store = createStore(appReducer, globalState as any);
    const component = renderComponent(store);
    expect(component.getByTestId("zendeskShowTicketsButton")).toBeDefined();
  });
  it("should render the zendesk show tickets icon", () => {
    const store = createStore(appReducer, globalState as any);
    const component = renderComponent(store);
    expect(component.getByTestId("zendeskShowTicketsIcon")).toBeDefined();
  });
  describe("when the user is authenticated with session info", () => {
    const store = createStore(appReducer, globalState as any);
    store.dispatch(idpSelected({} as SpidIdp));
    store.dispatch(
      loginSuccess({
        token: "abc1234" as SessionToken,
        idp: "test"
      })
    );
    describe("and the zendeskToken is defined", () => {
      store.dispatch(sessionInformationLoadSuccess(mockPublicSession));
      it("should call setUserIdentity with the zendeskToken", () => {
        renderComponent(store);
        expect(MockZendesk.setUserIdentity).toBeCalledWith({
          token: mockPublicSession.zendeskToken
        });
      });
    });
  });

  describe("when the user press the zendesk open ticket button", () => {
    it("should call openTicket", () => {
      const store = createStore(appReducer, globalState as any);

      const component = renderComponent(store);
      const zendeskButton = component.getByTestId("zendeskOpenTicketButton");
      fireEvent(zendeskButton, "onPress");
      expect(MockZendesk.openTicket).toBeCalledWith();
    });
  });
  describe("when the user press the zendesk show tickets button", () => {
    it("should call showTickets", () => {
      const store = createStore(appReducer, globalState as any);

      const component = renderComponent(store);
      const zendeskButton = component.getByTestId("zendeskShowTicketsButton");
      fireEvent(zendeskButton, "onPress");
      expect(MockZendesk.showTickets).toBeCalledWith();
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

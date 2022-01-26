import { NavigationParams } from "react-navigation";
import { createStore, Store } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import ROUTES from "../../../../navigation/routes";
import ZendeskSupportComponent from "../ZendeskSupportComponent";
import {
  idpSelected,
  loginSuccess,
  sessionInformationLoadSuccess
} from "../../../../store/actions/authentication";
import { SessionToken } from "../../../../types/SessionToken";
import { PublicSession } from "../../../../../definitions/backend/PublicSession";
import { SpidLevelEnum } from "../../../../../definitions/backend/SpidLevel";
import MockZendesk from "../../../../__mocks__/io-react-native-zendesk";
import { SpidIdp } from "../../../../../definitions/content/SpidIdp";
import {
  getZendeskConfig,
  zendeskRequestTicketNumber
} from "../../store/actions";
import * as zendeskNavigation from "../../store/actions/navigation";
import { Zendesk } from "../../../../../definitions/content/Zendesk";

const mockPublicSession: PublicSession = {
  bpdToken: "bpdToken",
  myPortalToken: "myPortalToken",
  spidLevel: SpidLevelEnum["https://www.spid.gov.it/SpidL2"],
  walletToken: "walletToken",
  zendeskToken: "zendeskToken"
};
const mockZendeskConfig: Zendesk = {
  panicMode: true
};
jest.useFakeTimers();

describe("the ZendeskSupportComponent", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  it("should render the zendesk open ticket button", () => {
    const store = createStore(appReducer, globalState as any);
    const component = renderComponent(store);
    expect(component.getByTestId("contactSupportButton")).toBeDefined();
  });
  it("should render the zendesk show tickets button, if the user already open a ticket", () => {
    const store = createStore(appReducer, globalState as any);
    const component = renderComponent(store);
    store.dispatch(zendeskRequestTicketNumber.success(1));
    expect(component.getByTestId("showTicketsButton")).toBeDefined();
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
    const navigateToZendeskAskPermissionsSpy = jest.spyOn(
      zendeskNavigation,
      "navigateToZendeskAskPermissions"
    );
    const navigateToZendeskPanicModeSpy = jest.spyOn(
      zendeskNavigation,
      "navigateToZendeskPanicMode"
    );
    afterEach(() => {
      jest.clearAllMocks();
    });
    it("if panic mode is false, should navigate to the ZendeskAskPermissions screen", () => {
      const store = createStore(appReducer, globalState as any);
      const component = renderComponent(store);
      const zendeskButton = component.getByTestId("contactSupportButton");
      fireEvent(zendeskButton, "onPress");
      expect(navigateToZendeskAskPermissionsSpy).toBeCalled();
      expect(navigateToZendeskPanicModeSpy).not.toBeCalled();
    });
    it("if panic mode is true, should navigate to the ZendeskAskPermissions screen", () => {
      const navigateToZendeskAskPermissionsSpy = jest.spyOn(
        zendeskNavigation,
        "navigateToZendeskAskPermissions"
      );
      const navigateToZendeskPanicModeSpy = jest.spyOn(
        zendeskNavigation,
        "navigateToZendeskPanicMode"
      );
      const store = createStore(appReducer, globalState as any);
      const component = renderComponent(store);
      store.dispatch(getZendeskConfig.success(mockZendeskConfig));
      const zendeskButton = component.getByTestId("contactSupportButton");
      fireEvent(zendeskButton, "onPress");
      expect(navigateToZendeskPanicModeSpy).toBeCalled();
      expect(navigateToZendeskAskPermissionsSpy).not.toBeCalled();
    });
  });
  describe("when the user press the zendesk show tickets button", () => {
    describe("if the user already open a ticket", () => {
      it("should call showTickets", () => {
        const store = createStore(appReducer, globalState as any);
        const component = renderComponent(store);
        store.dispatch(zendeskRequestTicketNumber.success(1));
        const zendeskButton = component.getByTestId("showTicketsButton");
        fireEvent(zendeskButton, "onPress");
        expect(MockZendesk.showTickets).toBeCalledWith();
      });
    });
  });
});

function renderComponent(store: Store<GlobalState>) {
  return renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    ZendeskSupportComponent,
    ROUTES.MAIN,
    {},
    store
  );
}

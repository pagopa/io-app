import { fireEvent } from "@testing-library/react-native";
import { createStore, Store } from "redux";
import { PublicSession } from "../../../../../definitions/backend/PublicSession";
import { SpidLevelEnum } from "../../../../../definitions/backend/SpidLevel";
import { SpidIdp } from "../../../../../definitions/content/SpidIdp";
import { Zendesk } from "../../../../../definitions/content/Zendesk";
import MockZendesk from "../../../../__mocks__/io-react-native-zendesk";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import {
  idpSelected,
  loginSuccess,
  sessionInformationLoadSuccess
} from "../../../../store/actions/authentication";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { SessionToken } from "../../../../types/SessionToken";
import { getNetworkError } from "../../../../utils/errors";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import {
  getZendeskConfig,
  zendeskRequestTicketNumber
} from "../../store/actions";
import ZendeskSupportComponent from "../ZendeskSupportComponent";

const mockPublicSession: PublicSession = {
  bpdToken: "bpdToken",
  myPortalToken: "myPortalToken",
  spidLevel: SpidLevelEnum["https://www.spid.gov.it/SpidL2"],
  walletToken: "walletToken",
  zendeskToken: "zendeskToken"
};
const mockZendeskConfig: Zendesk = {
  panicMode: false
};
const mockZendeskPanicModeConfig: Zendesk = {
  panicMode: true
};

const mockedNavigation = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockedNavigation,
      dispatch: jest.fn()
    })
  };
});

jest.useFakeTimers();

describe("the ZendeskSupportComponent", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  it("should render the zendesk open ticket button", () => {
    const store = createStore(appReducer, globalState as any);
    const component = renderComponent(store, false);
    expect(component.getByTestId("contactSupportButton")).toBeDefined();
  });
  it("should render the zendesk show tickets button, if the user already open a ticket", () => {
    const store = createStore(appReducer, globalState as any);
    const component = renderComponent(store, false);
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
        renderComponent(store, false);
        expect(MockZendesk.setUserIdentity).toBeCalledWith({
          token: mockPublicSession.zendeskToken
        });
      });
    });
  });

  describe("when the user press the zendesk open ticket button", () => {
    // const navigateToZendeskAskPermissionsSpy = jest.spyOn(
    //   zendeskNavigation,
    //   "navigateToZendeskAskPermissions"
    // );
    // const navigateToZendeskPanicModeSpy = jest.spyOn(
    //   zendeskNavigation,
    //   "navigateToZendeskPanicMode"
    // );
    // const navigateToZendeskChooseCategorySpy = jest.spyOn(
    //   zendeskNavigation,
    //   "navigateToZendeskChooseCategory"
    // );
    beforeEach(() => {
      // Alternatively, set "clearMocks" in your Jest config to "true"
      mockedNavigation.mockClear();
    });
    describe("if panic mode is false", () => {
      it("if the assistanceForPayment is true should navigate to the ZendeskAskPermissions screen", () => {
        const store = createStore(appReducer, globalState as any);
        const component = renderComponent(store, true);
        const zendeskButton = component.getByTestId("contactSupportButton");
        fireEvent(zendeskButton, "onPress");
        expect(mockedNavigation).toHaveBeenCalledTimes(1);
        expect(mockedNavigation).toHaveBeenCalledWith("ZENDESK_MAIN", {
          params: { assistanceForPayment: undefined },
          screen: "ZENDESK_ASK_PERMISSIONS"
        });
      });
      it("if the zendeskRemoteConfig is not remoteReady should navigate to the ZendeskAskPermissions screen", () => {
        const store = createStore(appReducer, globalState as any);
        const component = renderComponent(store, false);
        const zendeskButton = component.getByTestId("contactSupportButton");
        fireEvent(zendeskButton, "onPress");
        expect(mockedNavigation).toHaveBeenCalledTimes(1);
        expect(mockedNavigation).toHaveBeenCalledWith("ZENDESK_MAIN", {
          params: { assistanceForPayment: undefined },
          screen: "ZENDESK_ASK_PERMISSIONS"
        });
        store.dispatch(getZendeskConfig.request());
        fireEvent(zendeskButton, "onPress");
        expect(mockedNavigation).toHaveBeenCalledTimes(2);
        expect(mockedNavigation).toHaveBeenCalledWith("ZENDESK_MAIN", {
          params: { assistanceForPayment: undefined },
          screen: "ZENDESK_ASK_PERMISSIONS"
        });
        store.dispatch(
          getZendeskConfig.failure(getNetworkError("mockedError"))
        );
        fireEvent(zendeskButton, "onPress");
        expect(mockedNavigation).toHaveBeenCalledTimes(3);
        expect(mockedNavigation).toHaveBeenCalledWith("ZENDESK_MAIN", {
          params: { assistanceForPayment: undefined },
          screen: "ZENDESK_ASK_PERMISSIONS"
        });
      });
      it("if the assistanceForPayment is false and the zendeskRemoteConfig is remoteReady should navigate to the navigateToZendeskChooseCategory screen", () => {
        const store = createStore(appReducer, globalState as any);
        const component = renderComponent(store, false);
        store.dispatch(getZendeskConfig.success(mockZendeskConfig));
        const zendeskButton = component.getByTestId("contactSupportButton");
        fireEvent(zendeskButton, "onPress");
        expect(mockedNavigation).toHaveBeenCalledTimes(1);
        expect(mockedNavigation).toHaveBeenCalledWith("ZENDESK_MAIN", {
          params: { assistanceForPayment: undefined },
          screen: "ZENDESK_CHOOSE_CATEGORY"
        });
      });
    });

    it("if panic mode is true, should navigate to the ZendeskAskPermissions screen", () => {
      const store = createStore(appReducer, globalState as any);
      const component = renderComponent(store, false);
      store.dispatch(getZendeskConfig.success(mockZendeskPanicModeConfig));
      const zendeskButton = component.getByTestId("contactSupportButton");
      fireEvent(zendeskButton, "onPress");
      expect(mockedNavigation).toHaveBeenCalledTimes(1);
      expect(mockedNavigation).toHaveBeenCalledWith("ZENDESK_MAIN", {
        screen: "ZENDESK_PANIC_MODE"
      });
    });
  });
  describe("when the user press the zendesk show tickets button", () => {
    describe("if the user already open a ticket", () => {
      it("should call showTickets", () => {
        const store = createStore(appReducer, globalState as any);
        const component = renderComponent(store, false);
        store.dispatch(zendeskRequestTicketNumber.success(1));
        const zendeskButton = component.getByTestId("showTicketsButton");
        fireEvent(zendeskButton, "onPress");
        expect(MockZendesk.showTickets).toBeCalledWith();
      });
    });
  });
});

function renderComponent(
  store: Store<GlobalState>,
  assistanceForPayment: boolean
) {
  return renderScreenFakeNavRedux<GlobalState>(
    ZendeskSupportComponent,
    ROUTES.MAIN,
    { assistanceForPayment },
    store
  );
}

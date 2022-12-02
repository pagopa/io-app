import { fireEvent } from "@testing-library/react-native";
import { createStore, Store } from "redux";
import { SpidIdp } from "../../../../../definitions/content/SpidIdp";
import { Zendesk } from "../../../../../definitions/content/Zendesk";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import {
  idpSelected,
  loginSuccess
} from "../../../../store/actions/authentication";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { SessionToken } from "../../../../types/SessionToken";
import { getNetworkError } from "../../../../utils/errors";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import ZENDESK_ROUTES from "../../navigation/routes";
import {
  getZendeskConfig,
  zendeskRequestTicketNumber
} from "../../store/actions";
import ZendeskSupportComponent from "../ZendeskSupportComponent";

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
  it("should render the open ticket button and the show tickets button", () => {
    const store = createStore(appReducer, globalState as any);
    const component = renderComponent(store, false);
    store.dispatch(zendeskRequestTicketNumber.success(3));
    expect(component.getByTestId("contactSupportButton")).toBeDefined();
    expect(component.getByTestId("showTicketsButton")).toBeDefined();
  });

  describe("when the user is authenticated with session info", () => {
    beforeEach(() => {
      mockedNavigation.mockClear();
    });
    const store = createStore(appReducer, globalState as any);
    store.dispatch(idpSelected({} as SpidIdp));
    store.dispatch(
      loginSuccess({
        token: "abc1234" as SessionToken,
        idp: "test"
      })
    );
  });

  describe("when the user press the zendesk open ticket button", () => {
    beforeEach(() => {
      mockedNavigation.mockClear();
    });
    describe("if panic mode is false", () => {
      it("if the assistanceForPayment is true should navigate to the ZendeskAskPermissions screen", () => {
        const store = createStore(appReducer, globalState as any);
        const component = renderComponent(store, true);
        store.dispatch(zendeskRequestTicketNumber.success(3));
        const zendeskButton = component.getByTestId("contactSupportButton");
        fireEvent(zendeskButton, "onPress");
        expect(mockedNavigation).toHaveBeenCalledTimes(1);
        expect(mockedNavigation).toHaveBeenCalledWith("ZENDESK_MAIN", {
          params: { assistanceForPayment: undefined },
          screen: ZENDESK_ROUTES.ASK_PERMISSIONS
        });
      });
      it("if the zendeskRemoteConfig is not remoteReady should navigate to the ZendeskAskPermissions screen", () => {
        const store = createStore(appReducer, globalState as any);
        const component = renderComponent(store, false);
        store.dispatch(zendeskRequestTicketNumber.success(3));
        const zendeskButton = component.getByTestId("contactSupportButton");
        fireEvent(zendeskButton, "onPress");
        expect(mockedNavigation).toHaveBeenCalledTimes(1);
        expect(mockedNavigation).toHaveBeenCalledWith(ZENDESK_ROUTES.MAIN, {
          params: { assistanceForPayment: undefined },
          screen: ZENDESK_ROUTES.ASK_PERMISSIONS
        });
        store.dispatch(getZendeskConfig.request());
        fireEvent(zendeskButton, "onPress");
        expect(mockedNavigation).toHaveBeenCalledTimes(2);
        expect(mockedNavigation).toHaveBeenCalledWith(ZENDESK_ROUTES.MAIN, {
          params: { assistanceForPayment: undefined },
          screen: ZENDESK_ROUTES.ASK_PERMISSIONS
        });
        store.dispatch(
          getZendeskConfig.failure(getNetworkError("mockedError"))
        );
        fireEvent(zendeskButton, "onPress");
        expect(mockedNavigation).toHaveBeenCalledTimes(3);
        expect(mockedNavigation).toHaveBeenCalledWith(ZENDESK_ROUTES.MAIN, {
          params: { assistanceForPayment: undefined },
          screen: ZENDESK_ROUTES.ASK_PERMISSIONS
        });
      });

      describe("when the user press the zendesk show tickets button", () => {
        describe("if the user already open a ticket", () => {
          it("should call showTickets", () => {
            const store = createStore(appReducer, globalState as any);
            const component = renderComponent(store, false);
            const zendeskButton = component.getByTestId("showTicketsButton");
            fireEvent(zendeskButton, "onPress");
            expect(mockedNavigation).toHaveBeenCalledTimes(1);
            expect(mockedNavigation).toHaveBeenCalledWith(ZENDESK_ROUTES.MAIN, {
              params: { assistanceForPayment: undefined },
              screen: ZENDESK_ROUTES.SEE_REPORTS_ROUTERS
            });
          });
        });
      });

      it("if the assistanceForPayment is false and the zendeskRemoteConfig is remoteReady should navigate to the navigateToZendeskChooseCategory screen", () => {
        const store = createStore(appReducer, globalState as any);
        const component = renderComponent(store, false);
        store.dispatch(zendeskRequestTicketNumber.success(3));
        store.dispatch(getZendeskConfig.success(mockZendeskConfig));
        const zendeskButton = component.getByTestId("contactSupportButton");
        fireEvent(zendeskButton, "onPress");
        expect(mockedNavigation).toHaveBeenCalledTimes(1);
        expect(mockedNavigation).toHaveBeenCalledWith(ZENDESK_ROUTES.MAIN, {
          params: { assistanceForPayment: undefined },
          screen: ZENDESK_ROUTES.CHOOSE_CATEGORY
        });
      });
    });

    it("if panic mode is true, should navigate to the ZendeskAskPermissions screen", () => {
      const store = createStore(appReducer, globalState as any);
      const component = renderComponent(store, false);
      store.dispatch(zendeskRequestTicketNumber.success(3));
      store.dispatch(getZendeskConfig.success(mockZendeskPanicModeConfig));
      const zendeskButton = component.getByTestId("contactSupportButton");
      fireEvent(zendeskButton, "onPress");
      expect(mockedNavigation).toHaveBeenCalledTimes(1);
      expect(mockedNavigation).toHaveBeenCalledWith(ZENDESK_ROUTES.MAIN, {
        screen: ZENDESK_ROUTES.PANIC_MODE
      });
    });
  });
});

function renderComponent(
  store: Store<GlobalState>,
  assistanceForPayment: boolean
) {
  return renderScreenWithNavigationStoreContext<GlobalState>(
    ZendeskSupportComponent,
    ROUTES.MAIN,
    { assistanceForPayment },
    store
  );
}

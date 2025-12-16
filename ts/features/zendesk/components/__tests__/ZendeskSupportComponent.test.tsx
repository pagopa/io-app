import { act, fireEvent } from "@testing-library/react-native";
import { createStore, Store } from "redux";
import { Zendesk } from "../../../../../definitions/content/Zendesk";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { getNetworkError } from "../../../../utils/errors";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import ZENDESK_ROUTES from "../../navigation/routes";
import {
  getZendeskConfig,
  zendeskRequestTicketNumber
} from "../../store/actions";
import ZendeskSupportHelpCenter from "../../screens/ZendeskSupportHelpCenter";

const mockZendeskConfig: Zendesk = {
  panicMode: false
};
const mockZendeskPanicModeConfig: Zendesk = {
  panicMode: true
};

const mockedNavigation = jest.fn();
const mockedSetOptions = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockedNavigation,
      dispatch: jest.fn(),
      setOptions: mockedSetOptions
    })
  };
});

jest.useFakeTimers();

describe("the ZendeskSupportComponent", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  it("should render the open ticket button and the show tickets button", () => {
    const store = createStore(appReducer, globalState as any);
    const component = renderComponent(store, false);
    act(() => {
      store.dispatch(zendeskRequestTicketNumber.success(3));
    });
    expect(component.getByTestId("contactSupportButton")).toBeDefined();
    expect(component.getByTestId("showTicketsButton")).toBeDefined();
  });

  describe("when the user press the zendesk open ticket button", () => {
    beforeEach(() => {
      mockedNavigation.mockClear();
    });
    describe("if panic mode is false", () => {
      it("if the assistanceForPayment is true should navigate to the ZendeskAskPermissions screen", () => {
        const store = createStore(appReducer, globalState as any);
        const component = renderComponent(store, true);
        act(() => {
          store.dispatch(zendeskRequestTicketNumber.success(3));
        });
        const zendeskButton = component.getByTestId("contactSupportButton");
        fireEvent(zendeskButton, "onPress");
        expect(mockedNavigation).toHaveBeenCalledTimes(1);
        expect(mockedNavigation).toHaveBeenCalledWith("ZENDESK_MAIN", {
          params: {
            assistanceType: {
              payment: true,
              card: undefined,
              fci: undefined,
              itWallet: undefined
            }
          },
          screen: ZENDESK_ROUTES.ASK_PERMISSIONS
        });
      });
      it("if the zendeskRemoteConfig is not remoteReady should navigate to the ZendeskAskPermissions screen", () => {
        const store = createStore(appReducer, globalState as any);
        const component = renderComponent(store, false);
        act(() => {
          store.dispatch(zendeskRequestTicketNumber.success(3));
        });
        const zendeskButton = component.getByTestId("contactSupportButton");
        fireEvent(zendeskButton, "onPress");
        expect(mockedNavigation).toHaveBeenCalledTimes(1);
        expect(mockedNavigation).toHaveBeenCalledWith(ZENDESK_ROUTES.MAIN, {
          params: {
            assistanceType: {
              payment: false,
              card: undefined,
              fci: undefined,
              itWallet: undefined
            }
          },
          screen: ZENDESK_ROUTES.ASK_PERMISSIONS
        });
        act(() => {
          store.dispatch(getZendeskConfig.request());
        });
        fireEvent(zendeskButton, "onPress");
        expect(mockedNavigation).toHaveBeenCalledTimes(2);
        expect(mockedNavigation).toHaveBeenCalledWith(ZENDESK_ROUTES.MAIN, {
          params: {
            assistanceType: {
              payment: false,
              card: undefined,
              fci: undefined,
              itWallet: undefined
            }
          },
          screen: ZENDESK_ROUTES.ASK_PERMISSIONS
        });
        act(() => {
          store.dispatch(
            getZendeskConfig.failure(getNetworkError("mockedError"))
          );
        });
        fireEvent(zendeskButton, "onPress");
        expect(mockedNavigation).toHaveBeenCalledTimes(3);
        expect(mockedNavigation).toHaveBeenCalledWith(ZENDESK_ROUTES.MAIN, {
          params: {
            assistanceType: {
              payment: false,
              card: undefined,
              fci: undefined,
              itWallet: undefined
            }
          },
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
              params: {
                assistanceType: {
                  payment: false,
                  card: undefined,
                  fci: undefined,
                  itWallet: undefined
                }
              },
              screen: ZENDESK_ROUTES.SEE_REPORTS_ROUTERS
            });
          });
        });
      });

      it("if the assistanceForPayment is false and the zendeskRemoteConfig is remoteReady should navigate to the navigateToZendeskChooseCategory screen", () => {
        const store = createStore(appReducer, globalState as any);
        const component = renderComponent(store, false);
        act(() => {
          store.dispatch(zendeskRequestTicketNumber.success(3));
          store.dispatch(getZendeskConfig.success(mockZendeskConfig));
        });
        const zendeskButton = component.getByTestId("contactSupportButton");
        fireEvent(zendeskButton, "onPress");
        expect(mockedNavigation).toHaveBeenCalledTimes(1);
        expect(mockedNavigation).toHaveBeenCalledWith(ZENDESK_ROUTES.MAIN, {
          params: {
            assistanceType: {
              payment: false,
              card: undefined,
              fci: undefined,
              itWallet: undefined
            }
          },
          screen: ZENDESK_ROUTES.CHOOSE_CATEGORY
        });
      });
    });

    it("if panic mode is true, should navigate to the ZendeskAskPermissions screen", () => {
      const store = createStore(appReducer, globalState as any);
      const component = renderComponent(store, false);
      act(() => {
        store.dispatch(zendeskRequestTicketNumber.success(3));
        store.dispatch(getZendeskConfig.success(mockZendeskPanicModeConfig));
      });
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
    ZendeskSupportHelpCenter,
    ROUTES.MAIN,
    { assistanceType: { payment: assistanceForPayment } },
    store
  );
}

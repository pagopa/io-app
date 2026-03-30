import { createStore, Store } from "redux";
import { act, fireEvent, RenderAPI } from "@testing-library/react-native";
import { ReactTestInstance } from "react-test-renderer";
import { InitializedProfile } from "../../../../../definitions/backend/InitializedProfile";
import MockZendesk from "../../../../__mocks__/io-react-native-zendesk";
import * as mixpanel from "../../../../mixpanel";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { profileLoadSuccess } from "../../../settings/common/store/actions";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import * as appVersion from "../../../../utils/appVersion";
import * as device from "../../../../utils/device";
import { SpidIdp } from "../../../../utils/idps";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as url from "../../../../utils/url";
import {
  idpSelected,
  loginSuccess
} from "../../../authentication/common/store/actions";
import * as zendeskAction from "../../store/actions";
import { zendeskSelectedCategory } from "../../store/actions";
import ZendeskAskPermissions from "../ZendeskAskPermissions";

jest.useFakeTimers();

const mockedIdp: SpidIdp = {
  id: "1",
  name: "mockedIdp",
  logo: { light: { uri: "mockedIdpLogo" } },
  profileUrl: "mockedProfileUrl"
};

const mockedZendeskCategory = {
  value: "mockedValue",
  description: {
    "it-IT": "mock_description",
    "en-EN": "mock_description",
    "de-DE": "mock_description"
  }
};

describe("the ZendeskAskPermissions screen", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  jest.spyOn(device, "getModel").mockReturnValue("mockedModel");
  jest.spyOn(device, "getSystemVersion").mockReturnValue("mockedSystemVersion");
  jest.spyOn(appVersion, "getAppVersion").mockReturnValue("mockedVersion");
  const globalState = appReducer(undefined, applicationChangeState("active"));

  it("should call the zendeskSupportFailure if the zendeskSelectedCategory is undefined", () => {
    const zendeskSupportFailureSpy = jest.spyOn(
      zendeskAction,
      "zendeskSupportFailure"
    );
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    renderComponent(store, true);
    expect(zendeskSupportFailureSpy).toBeCalled();
  });
  it("should render the screen container", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    act(() => {
      store.dispatch(zendeskSelectedCategory(mockedZendeskCategory));
    });
    const component: RenderAPI = renderComponent(store, true);
    expect(component.getByTestId("ZendeskAskPermissions")).toBeDefined();
  });

  it("should render the appVersionsHistory item", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    act(() => {
      store.dispatch(zendeskSelectedCategory(mockedZendeskCategory));
    });
    const component: RenderAPI = renderComponent(store, true);
    expect(component.getByTestId("appVersionsHistory")).toBeDefined();
  });

  it("should render the paymentIssues item if assistanceForPayment prop is true", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    act(() => {
      store.dispatch(zendeskSelectedCategory(mockedZendeskCategory));
    });
    const component: RenderAPI = renderComponent(store, true);
    expect(component.getByTestId("paymentIssues")).toBeDefined();
  });
  it("shouldn't render the paymentIssues item if assistanceForPayment prop is false", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    act(() => {
      store.dispatch(zendeskSelectedCategory(mockedZendeskCategory));
    });
    const component: RenderAPI = renderComponent(store, false);
    expect(component.queryByTestId("paymentIssues")).toBeNull();
  });
  it("shouldn't render identityProvider, fiscalCode, nameSurname, email items if are not available", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    act(() => {
      store.dispatch(zendeskSelectedCategory(mockedZendeskCategory));
    });
    const component: RenderAPI = renderComponent(store, false);
    expect(component.queryByTestId("identityProvider")).toBeNull();
    expect(component.queryByTestId("profileFiscalCode")).toBeNull();
    expect(component.queryByTestId("profileNameSurname")).toBeNull();
    expect(component.queryByTestId("profileEmail")).toBeNull();
  });
  it("should render identityProvider if is available", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    act(() => {
      store.dispatch(zendeskSelectedCategory(mockedZendeskCategory));
    });
    const component: RenderAPI = renderComponent(store, false);
    act(() => {
      store.dispatch(idpSelected(mockedIdp));
    });
    expect(component.queryByTestId("identityProvider")).not.toBeNull();
  });
  describe("if user is logged in", () => {
    it("should render fiscalCode if is available", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      const component: RenderAPI = renderComponent(store, false);
      act(() => {
        store.dispatch(zendeskSelectedCategory(mockedZendeskCategory));
        store.dispatch(idpSelected(mockedIdp));
        store.dispatch(
          loginSuccess({
            idp: "test",
            token: "mock-token"
          })
        );
        store.dispatch(
          profileLoadSuccess({
            fiscal_code: "mockedFiscalCode"
          } as InitializedProfile)
        );
      });
      expect(component.queryByTestId("profileFiscalCode")).not.toBeNull();
    });
    it("should render nameSurname if is available", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      const component: RenderAPI = renderComponent(store, false);
      act(() => {
        store.dispatch(zendeskSelectedCategory(mockedZendeskCategory));
        store.dispatch(idpSelected(mockedIdp));
        store.dispatch(
          loginSuccess({
            idp: "test",
            token: "mock-token"
          })
        );
        store.dispatch(
          profileLoadSuccess({
            family_name: "mockedFamilyName",
            name: "mockedName"
          } as InitializedProfile)
        );
      });
      expect(component.queryByTestId("profileNameSurname")).not.toBeNull();
    });
    it("should render email if is available", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      const component: RenderAPI = renderComponent(store, false);
      act(() => {
        store.dispatch(zendeskSelectedCategory(mockedZendeskCategory));

        store.dispatch(idpSelected(mockedIdp));
        store.dispatch(
          loginSuccess({
            idp: "test",
            token: "mock-token"
          })
        );
        store.dispatch(
          profileLoadSuccess({
            email: "mockedEmail"
          } as InitializedProfile)
        );
      });
      expect(component.queryByTestId("profileEmail")).not.toBeNull();
    });
  });

  it("should call handleItemOnPress, mixpanelTrack and workUnitCompleted when the cancel button is pressed", () => {
    const handleItemOnPressSpy = jest
      .spyOn(url, "handleItemOnPress")
      .mockImplementation(() => jest.fn());
    const mixpanelTrackSpy = jest.spyOn(mixpanel, "mixpanelTrack");
    const zendeskSupportCompletedSpy = jest.spyOn(
      zendeskAction,
      "zendeskSupportCompleted"
    );
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    act(() => {
      store.dispatch(zendeskSelectedCategory(mockedZendeskCategory));
    });
    const component: RenderAPI = renderComponent(store, false);
    const cancelButton = component.getByTestId("cancelButtonId");
    fireEvent(cancelButton, "onPress");
    expect(handleItemOnPressSpy).toBeCalled();
    expect(mixpanelTrackSpy).toBeCalled();
    expect(zendeskSupportCompletedSpy).toBeCalled();
  });

  describe("when the continue button is pressed", () => {
    const mixpanelTrackSpy = jest.spyOn(mixpanel, "mixpanelTrack");

    it("should call the openSupportTicket, the mixpanelTrack and the workUnitCompleted functions", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      act(() => {
        store.dispatch(zendeskSelectedCategory(mockedZendeskCategory));
      });
      const component: RenderAPI = renderComponent(store, false);

      const continueButton: ReactTestInstance =
        component.getByTestId("continueButtonId");
      fireEvent(continueButton, "onPress");
      expect(mixpanelTrackSpy).toBeCalled();
      expect(MockZendesk.openTicket).toBeCalled();
    });
  });
});

function renderComponent(
  store: Store<GlobalState>,
  assistanceForPayment: boolean
) {
  return renderScreenWithNavigationStoreContext<GlobalState>(
    ZendeskAskPermissions,
    ROUTES.MAIN,
    { assistanceType: { payment: assistanceForPayment } },
    store
  );
}

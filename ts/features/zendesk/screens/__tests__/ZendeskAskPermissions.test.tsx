import { createStore, Store } from "redux";
import { fireEvent, RenderAPI } from "@testing-library/react-native";
import { ReactTestInstance } from "react-test-renderer";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import ZendeskAskPermissions from "../ZendeskAskPermissions";
import ROUTES from "../../../../navigation/routes";
import * as device from "../../../../utils/device";
import * as appVersion from "../../../../utils/appVersion";
import {
  idpSelected,
  loginSuccess
} from "../../../../store/actions/authentication";
import { SpidIdp } from "../../../../../definitions/content/SpidIdp";
import { SessionToken } from "../../../../types/SessionToken";
import { profileLoadSuccess } from "../../../../store/actions/profile";
import { InitializedProfile } from "../../../../../definitions/backend/InitializedProfile";
import * as mixpanel from "../../../../mixpanel";
import * as zendeskAction from "../../store/actions";
import * as url from "../../../../utils/url";
import { zendeskSelectedCategory } from "../../store/actions";
import MockZendesk from "../../../../__mocks__/io-react-native-zendesk";

jest.useFakeTimers();

const mockedIdp: SpidIdp = {
  id: "1",
  name: "mockedIdp",
  logo: "mockedIdpLogo",
  profileUrl: "mockedProfileUrl"
};

const mockedZendeskCategory = {
  value: "mockedValue",
  description: {
    "it-IT": "mock_description",
    "en-EN": "mock_description"
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
    store.dispatch(zendeskSelectedCategory(mockedZendeskCategory));
    const component: RenderAPI = renderComponent(store, true);
    expect(component.getByTestId("ZendeskAskPermissions")).toBeDefined();
  });

  it("should render the appVersionsHistory item", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(zendeskSelectedCategory(mockedZendeskCategory));
    const component: RenderAPI = renderComponent(store, true);
    expect(component.getByTestId("appVersionsHistory")).toBeDefined();
  });

  it("should render the paymentIssues item if assistanceForPayment prop is true", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(zendeskSelectedCategory(mockedZendeskCategory));
    const component: RenderAPI = renderComponent(store, true);
    expect(component.getByTestId("paymentIssues")).toBeDefined();
  });
  it("shouldn't render the paymentIssues item if assistanceForPayment prop is false", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(zendeskSelectedCategory(mockedZendeskCategory));
    const component: RenderAPI = renderComponent(store, false);
    expect(component.queryByTestId("paymentIssues")).toBeNull();
  });
  it("shouldn't render identityProvider, fiscalCode, nameSurname, email items if are not available", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(zendeskSelectedCategory(mockedZendeskCategory));
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
    store.dispatch(zendeskSelectedCategory(mockedZendeskCategory));
    const component: RenderAPI = renderComponent(store, false);
    store.dispatch(idpSelected(mockedIdp));
    expect(component.queryByTestId("identityProvider")).not.toBeNull();
  });
  describe("if user is logged in", () => {
    it("should render fiscalCode if is available", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      store.dispatch(zendeskSelectedCategory(mockedZendeskCategory));
      const component: RenderAPI = renderComponent(store, false);
      store.dispatch(idpSelected(mockedIdp));
      store.dispatch(
        loginSuccess({
          idp: "test",
          token: "123456" as SessionToken
        })
      );
      store.dispatch(
        profileLoadSuccess({
          fiscal_code: "mockedFiscalCode"
        } as InitializedProfile)
      );
      expect(component.queryByTestId("profileFiscalCode")).not.toBeNull();
    });
    it("should render nameSurname if is available", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      store.dispatch(zendeskSelectedCategory(mockedZendeskCategory));
      const component: RenderAPI = renderComponent(store, false);
      store.dispatch(idpSelected(mockedIdp));
      store.dispatch(
        loginSuccess({
          idp: "test",
          token: "123456" as SessionToken
        })
      );
      store.dispatch(
        profileLoadSuccess({
          family_name: "mockedFamilyName",
          name: "mockedName"
        } as InitializedProfile)
      );
      expect(component.queryByTestId("profileNameSurname")).not.toBeNull();
    });
    it("should render email if is available", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      store.dispatch(zendeskSelectedCategory(mockedZendeskCategory));
      const component: RenderAPI = renderComponent(store, false);
      store.dispatch(idpSelected(mockedIdp));
      store.dispatch(
        loginSuccess({
          idp: "test",
          token: "123456" as SessionToken
        })
      );
      store.dispatch(
        profileLoadSuccess({
          email: "mockedEmail"
        } as InitializedProfile)
      );
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
    store.dispatch(zendeskSelectedCategory(mockedZendeskCategory));
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
      store.dispatch(zendeskSelectedCategory(mockedZendeskCategory));
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
  return renderScreenFakeNavRedux<GlobalState>(
    ZendeskAskPermissions,
    ROUTES.MAIN,
    { assistanceForPayment },
    store
  );
}

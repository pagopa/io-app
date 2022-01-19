import { NavigationParams } from "react-navigation";
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
import * as url from "../../../../utils/url";
import * as mixpanel from "../../../../mixpanel";
import * as zendeskAction from "../../store/actions";
import { getZendeskConfig } from "../../store/actions";
import MockZendesk from "../../../../__mocks__/io-react-native-zendesk";
import { Zendesk } from "../../../../../definitions/content/Zendesk";
import * as navigationAction from "../../store/actions/navigation";

jest.useFakeTimers();

const mockedIdp: SpidIdp = {
  id: "1",
  name: "mockedIdp",
  logo: "mockedIdpLogo",
  profileUrl: "mockedProfileUrl"
};

const mockedZendeskConfig: Zendesk = {
  panicMode: false,
  zendeskCategories: {
    id: "12345",
    categories: [
      {
        value: "mockedValue",
        description: {
          "it-IT": "mock_description",
          "en-EN": "mock_description"
        }
      }
    ]
  }
};

describe("the ZendeskAskPermissions screen", () => {
  jest.spyOn(device, "getModel").mockReturnValue("mockedModel");
  jest.spyOn(device, "getSystemVersion").mockReturnValue("mockedSystemVersion");
  jest.spyOn(appVersion, "getAppVersion").mockReturnValue("mockedVersion");
  const globalState = appReducer(undefined, applicationChangeState("active"));

  it("should render the screen container", () => {
    const store = createStore(appReducer, globalState as any);
    const component = renderComponent(store, true);
    expect(component.getByTestId("ZendeskAskPermissions")).toBeDefined();
  });

  it("should render the paymentIssues item if assistanceForPayment prop is true", () => {
    const store = createStore(appReducer, globalState as any);
    const component = renderComponent(store, true);
    expect(component.getByTestId("paymentIssues")).toBeDefined();
  });
  it("shouldn't render the paymentIssues item if assistanceForPayment prop is false", () => {
    const store = createStore(appReducer, globalState as any);
    const component = renderComponent(store, false);
    expect(component.queryByTestId("paymentIssues")).toBeNull();
  });
  it("shouldn't render identityProvider, fiscalCode, nameSurname, email items if are not available", () => {
    const store = createStore(appReducer, globalState as any);
    const component = renderComponent(store, false);
    expect(component.queryByTestId("identityProvider")).toBeNull();
    expect(component.queryByTestId("profileFiscalCode")).toBeNull();
    expect(component.queryByTestId("profileNameSurname")).toBeNull();
    expect(component.queryByTestId("profileEmail")).toBeNull();
  });
  it("should render identityProvider if is available", () => {
    const store = createStore(appReducer, globalState as any);
    const component = renderComponent(store, false);
    store.dispatch(idpSelected(mockedIdp));
    expect(component.queryByTestId("identityProvider")).not.toBeNull();
  });
  describe("if user is logged in", () => {
    // eslint-disable-next-line functional/no-let
    let store: Store<GlobalState>;
    // eslint-disable-next-line functional/no-let
    let component: RenderAPI;

    beforeEach(() => {
      store = createStore(appReducer, globalState as any);
      component = renderComponent(store, false);
      store.dispatch(idpSelected(mockedIdp));
      store.dispatch(
        loginSuccess({
          idp: "test",
          token: "123456" as SessionToken
        })
      );
    });

    it("should render fiscalCode if is available", () => {
      store.dispatch(
        profileLoadSuccess({
          fiscal_code: "mockedFiscalCode"
        } as InitializedProfile)
      );
      expect(component.queryByTestId("profileFiscalCode")).not.toBeNull();
    });
    it("should render nameSurname if is available", () => {
      store.dispatch(
        profileLoadSuccess({
          family_name: "mockedFamilyName",
          name: "mockedName"
        } as InitializedProfile)
      );
      expect(component.queryByTestId("profileNameSurname")).not.toBeNull();
    });
    it("should render email if is available", () => {
      store.dispatch(
        profileLoadSuccess({
          email: "mockedEmail"
        } as InitializedProfile)
      );
      expect(component.queryByTestId("profileEmail")).not.toBeNull();
    });
  });

  it("should call openWebUrl, mixpanelTrack and workUnitCompleted when the cancel button is pressed", () => {
    const openWebUrlSpy = jest.spyOn(url, "openWebUrl");
    const mixpanelTrackSpy = jest.spyOn(mixpanel, "mixpanelTrack");
    const zendeskSupportCompletedSpy = jest.spyOn(
      zendeskAction,
      "zendeskSupportCompleted"
    );
    const store = createStore(appReducer, globalState as any);
    const component = renderComponent(store, false);
    const cancelButton = component.getByTestId("cancelButtonId");
    fireEvent(cancelButton, "onPress");
    expect(openWebUrlSpy).toBeCalled();
    expect(mixpanelTrackSpy).toBeCalled();
    expect(zendeskSupportCompletedSpy).toBeCalled();
  });

  describe("when the continue button is pressed", () => {
    const mixpanelTrackSpy = jest.spyOn(mixpanel, "mixpanelTrack");
    // eslint-disable-next-line functional/no-let
    let store: Store<GlobalState>;
    // eslint-disable-next-line functional/no-let
    let component: RenderAPI;
    // eslint-disable-next-line functional/no-let
    let continueButton: ReactTestInstance;

    beforeEach(() => {
      store = createStore(appReducer, globalState as any);
    });

    describe("should call the openSupportTicket, the mixpanelTrack and the workUnitCompleted functions", () => {
      it("if the zendeskConfig is not ready", () => {
        component = renderComponent(store, false);
        store.dispatch(getZendeskConfig.request());
      });
      it("if the assistanceForPayment prop is true", () => {
        component = renderComponent(store, true);
        store.dispatch(getZendeskConfig.success(mockedZendeskConfig));
      });
      it("if the there are no category", () => {
        component = renderComponent(store, false);
        store.dispatch(
          getZendeskConfig.success({ panicMode: mockedZendeskConfig.panicMode })
        );
      });

      afterEach(() => {
        continueButton = component.getByTestId("continueButtonId");
        fireEvent(continueButton, "onPress");
        expect(mixpanelTrackSpy).toBeCalled();
        expect(MockZendesk.openTicket).toBeCalled();
      });
    });

    it("should call the navigateToZendeskChooseCategory function if the assistanceForPayment is false, the ZendeskConfig is ready and there is at least a category", () => {
      const navigateToZendeskChooseCategorySpy = jest.spyOn(
        navigationAction,
        "navigateToZendeskChooseCategory"
      );
      component = renderComponent(store, false);
      store.dispatch(getZendeskConfig.success(mockedZendeskConfig));
      continueButton = component.getByTestId("continueButtonId");
      fireEvent(continueButton, "onPress");
      expect(navigateToZendeskChooseCategorySpy).toBeCalled();
    });
  });
});

function renderComponent(
  store: Store<GlobalState>,
  assistanceForPayment: boolean
) {
  return renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    ZendeskAskPermissions,
    ROUTES.MAIN,
    { assistanceForPayment },
    store
  );
}

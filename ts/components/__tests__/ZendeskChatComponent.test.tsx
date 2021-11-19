import { appReducer } from "../../store/reducers";
import { applicationChangeState } from "../../store/actions/application";
import { GlobalState } from "../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../utils/testWrapper";
import { NavigationParams } from "react-navigation";
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
import { createStore, Store } from "redux";
import { SpidIdp } from "../../../definitions/content/SpidIdp";
import { fireEvent } from "@testing-library/react-native";
import { profileLoadSuccess } from "../../store/actions/profile";
import { EmailAddress } from "../../../definitions/backend/EmailAddress";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";

const mockPublicSession: PublicSession = {
  bpdToken: "bpdToken",
  myPortalToken: "myPortalToken",
  spidLevel: SpidLevelEnum["https://www.spid.gov.it/SpidL2"],
  walletToken: "walletToken",
  zendeskToken: "zendeskToken"
};
describe("the ZendeskChatComponent", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  it("should render the zendesk button", () => {
    const store = createStore(appReducer, globalState as any);
    const component = renderComponent(store);
    expect(component.getByTestId("zendeskButton")).toBeDefined();
  });
  it("should render the zendesk icon", () => {
    const store = createStore(appReducer, globalState as any);
    const component = renderComponent(store);
    expect(component.getByTestId("zendeskIcon")).toBeDefined();
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

  describe("when the user press the zendesk button and has an initializedProfile", () => {
    const store = createStore(appReducer, globalState as any);
    const component = renderComponent(store);
    const zendeskButton = component.getByTestId("zendeskButton");
    const mockProfile = {
      name: "testUser",
      email: "test@email.it" as EmailAddress
    } as InitializedProfile;

    store.dispatch(profileLoadSuccess(mockProfile));
    fireEvent(zendeskButton, "onPress");

    it("should call startChat with the profile data", () => {
      expect(MockZendesk.startChat).toBeCalledWith({
        botName: "IO BOT",
        name: mockProfile.name,
        email: mockProfile.email,
        department: "appiotest"
      });
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

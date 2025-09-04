import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import IdpSelectionScreen from "../IdpSelectionScreen";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import * as IOHooks from "../../../../../../store/hooks";
import { loadIdps } from "../../../../../../store/actions/content";
import * as supportAssistance from "../../../../../../utils/supportAssistance";
import * as analytics from "../../../../common/analytics/spidAnalytics";
import { idpSelected } from "../../../../common/store/actions";
import * as idpsRemoteValue from "../../../../../../store/reducers/content.ts";

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate
    })
  };
});

const mockNavigate = jest.fn();

jest.mock("../../../../../../hooks/useHeaderSecondLevel", () => ({
  useHeaderSecondLevel: jest.fn()
}));

describe("IdpSelectionScreen", () => {
  const mockDispatch = jest.fn();

  jest.spyOn(IOHooks, "useIODispatch").mockReturnValue(mockDispatch);

  jest.spyOn(idpsRemoteValue, "idpsRemoteValueSelector").mockReturnValue({
    kind: "ready",
    value: [
      {
        id: "testidp1",
        name: "testidp1",
        logo: { light: { uri: "" } },
        profileUrl: ""
      },
      {
        id: "testidp2",
        name: "testidp2",
        logo: { light: { uri: "" } },
        profileUrl: ""
      }
    ]
  });

  it("should match snapshots", () => {
    const component = renderComponent();
    expect(component.toJSON).toMatchSnapshot();
  });

  it("should renders correctly", () => {
    const { getByTestId } = renderComponent();
    const test = getByTestId("idps-grid");
    expect(test).toBeTruthy();
  });

  it("should show banner content", () => {
    const { getByText } = renderComponent();
    expect(getByText(I18n.t("login.help_banner_title"))).toBeTruthy();
    expect(getByText(I18n.t("login.help_banner_content"))).toBeTruthy();
    expect(getByText(I18n.t("login.help_banner_action"))).toBeTruthy();
  });

  it("should dispatch loadIdps.request on mount", () => {
    renderComponent();
    expect(mockDispatch).toHaveBeenCalledWith(loadIdps.request());
  });

  it("should dispatch idpSelected and navigate to IDP_LOGIN when native login is disabled", () => {
    jest.spyOn(IOHooks, "useIODispatch").mockReturnValue(mockDispatch);

    jest
      .spyOn(supportAssistance, "handleSendAssistanceLog")
      .mockImplementation(jest.fn());
    jest
      .spyOn(analytics, "trackLoginSpidIdpSelected")
      .mockImplementation(jest.fn());

    const { getByText } = renderComponent();
    const selectedIdpMock = {
      id: "testidp2",
      name: "testidp2",
      logo: { light: { uri: "" } },
      profileUrl: ""
    };

    expect(getByText(selectedIdpMock.name)).toBeTruthy();
    fireEvent.press(getByText(selectedIdpMock.name));

    expect(mockDispatch).toHaveBeenCalledWith(idpSelected(selectedIdpMock));
    expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.IDP_LOGIN
    });
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    IdpSelectionScreen,
    AUTHENTICATION_ROUTES.IDP_SELECTION,
    {},
    store
  );
};

import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import _, { merge } from "lodash";
import { ComponentProps } from "react";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import * as IOHooks from "../../../../../../store/hooks";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as activeSessionLoginAnalytics from "../../../../activeSessionLogin/screens/analytics";
import { setIdpSelectedActiveSessionLogin } from "../../../../activeSessionLogin/store/actions";
import * as commonAnalytics from "../../../../common/analytics";
import * as analytics from "../../../../common/analytics/spidAnalytics";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import { idpSelected } from "../../../../common/store/actions";
import { Idps } from "../../types/idps";
import { OneIdentityIdpSelectionScreen } from "../OneIdentityIdpSelectionScreen";

const mockUseGetIdps = jest.fn();
jest.mock("../../hooks/useGetIdps", () => ({
  useGetIdps: () => mockUseGetIdps()
}));

const mockNavigateToCiePinInsertion = jest.fn();
const mockNavigateToCieIdLoginScreen = jest.fn();
jest.mock("../../../hooks/useNavigateToLoginMethod", () => ({
  __esModule: true,
  default: () => ({
    navigateToCiePinInsertion: mockNavigateToCiePinInsertion,
    navigateToCieIdLoginScreen: mockNavigateToCieIdLoginScreen,
    isCieSupported: true
  })
}));

jest.mock("@gorhom/bottom-sheet", () =>
  jest.requireActual("../../../../../../__mocks__/@gorhom/bottom-sheet")
);

const mockNavigate = jest.fn();

const mockIdps: Idps = [
  {
    entityID: "https://idp1.example.com",
    status: "public",
    friendlyName: "IDP One",
    active: true
  },
  {
    entityID: "https://idp2.example.com",
    status: "public",
    friendlyName: "IDP Two",
    active: true
  }
];

describe("OneIdentityIdpSelectionScreen", () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(IOHooks, "useIODispatch").mockReturnValue(mockDispatch);
  });

  it("should render the loading skeleton while the IDPs are being fetched", () => {
    mockUseGetIdps.mockReturnValue({
      state: { status: "loading" }
    });

    const { getAllByLabelText } = renderComponent();

    const skeletonItems = getAllByLabelText(
      I18n.t("authentication.idp_selection.idps.loadingAccessibilityLabel")
    );
    expect(skeletonItems.length).toBe(5);
  });

  it("should render the loading error screen when the fetch fails", () => {
    mockUseGetIdps.mockReturnValue({
      state: { status: "failure", error: new Error("network error") }
    });

    const { queryByTestId } = renderComponent();

    expect(queryByTestId("idps-grid")).toBeNull();
    expect(queryByTestId("idp-loading-error-primary-action")).toBeTruthy();
    expect(queryByTestId("idp-loading-error-secondary-action")).toBeTruthy();
  });

  it("should navigate to the landing screen when pressing the secondary action on the loading error screen", () => {
    mockUseGetIdps.mockReturnValue({
      state: { status: "failure", error: new Error("network error") }
    });

    const { getByTestId } = renderComponent();

    fireEvent.press(getByTestId("idp-loading-error-secondary-action"));

    expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.LANDING
    });
  });

  it("should track trackCieLoginSelected and open the CIE bottom sheet when pressing the primary action on the loading error screen while not in an active session", () => {
    jest
      .spyOn(commonAnalytics, "trackCieLoginSelected")
      .mockImplementation(jest.fn());
    jest
      .spyOn(
        activeSessionLoginAnalytics,
        "trackLoginReauthEngagementCieSelected"
      )
      .mockImplementation(jest.fn());

    mockUseGetIdps.mockReturnValue({
      state: { status: "failure", error: new Error("network error") }
    });

    const { getByTestId } = renderComponent();

    fireEvent.press(getByTestId("idp-loading-error-primary-action"));

    expect(commonAnalytics.trackCieLoginSelected).toHaveBeenCalled();
    expect(
      activeSessionLoginAnalytics.trackLoginReauthEngagementCieSelected
    ).not.toHaveBeenCalled();
    expect(getByTestId("bottom-sheet-login-with-cie-pin")).toBeTruthy();
  });

  it("should track trackLoginReauthEngagementCieSelected when pressing the primary action on the loading error screen during an active session", () => {
    jest
      .spyOn(commonAnalytics, "trackCieLoginSelected")
      .mockImplementation(jest.fn());
    jest
      .spyOn(
        activeSessionLoginAnalytics,
        "trackLoginReauthEngagementCieSelected"
      )
      .mockImplementation(jest.fn());

    mockUseGetIdps.mockReturnValue({
      state: { status: "failure", error: new Error("network error") }
    });

    const { getByTestId } = renderComponent({ isActiveSessionLogin: true });

    fireEvent.press(getByTestId("idp-loading-error-primary-action"));

    expect(
      activeSessionLoginAnalytics.trackLoginReauthEngagementCieSelected
    ).toHaveBeenCalled();
    expect(commonAnalytics.trackCieLoginSelected).not.toHaveBeenCalled();
  });

  it("should render the fetched IDPs on success", () => {
    mockUseGetIdps.mockReturnValue({
      state: { status: "success", data: mockIdps }
    });

    const { getByText } = renderComponent();

    expect(getByText("IDP One")).toBeTruthy();
    expect(getByText("IDP Two")).toBeTruthy();
  });

  it("should render the help banner content", () => {
    mockUseGetIdps.mockReturnValue({
      state: { status: "loading" }
    });

    const { getByText } = renderComponent();

    expect(getByText(I18n.t("login.help_banner_title"))).toBeTruthy();
    expect(getByText(I18n.t("login.help_banner_content"))).toBeTruthy();
    expect(getByText(I18n.t("login.help_banner_action"))).toBeTruthy();
  });

  it("should dispatch idpSelected and navigate to IDP_LOGIN when pressing an IDP while not in an active session", () => {
    jest
      .spyOn(analytics, "trackLoginSpidIdpSelected")
      .mockImplementation(jest.fn());

    mockUseGetIdps.mockReturnValue({
      state: { status: "success", data: mockIdps }
    });

    const { getByText } = renderComponent();

    fireEvent.press(getByText("IDP One"));

    expect(mockDispatch).toHaveBeenCalledWith(
      idpSelected(expect.objectContaining({ id: "https://idp1.example.com" }))
    );
    expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.IDP_LOGIN
    });
  });

  it("should dispatch setIdpSelectedActiveSessionLogin and navigate to the active session login when pressing an IDP during an active session", () => {
    jest
      .spyOn(analytics, "trackLoginSpidIdpSelected")
      .mockImplementation(jest.fn());

    mockUseGetIdps.mockReturnValue({
      state: { status: "success", data: mockIdps }
    });

    const { getByText } = renderComponent({ isActiveSessionLogin: true });

    fireEvent.press(getByText("IDP One"));

    expect(mockDispatch).toHaveBeenCalledWith(
      setIdpSelectedActiveSessionLogin(
        expect.objectContaining({ id: "https://idp1.example.com" })
      )
    );
    expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.IDP_LOGIN_ACTIVE_SESSION_LOGIN
    });
  });
});

const renderComponent = ({
  isActiveSessionLogin = false
}: { isActiveSessionLogin?: boolean } = {}) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const finalState = merge(undefined, globalState, {
    features: {
      loginFeatures: {
        activeSessionLogin: {
          isActiveSessionLogin
        }
      }
    }
  } as GlobalState);
  const store = createStore(appReducer, finalState);

  return renderScreenWithNavigationStoreContext(
    (props: ComponentProps<typeof OneIdentityIdpSelectionScreen>) => (
      <OneIdentityIdpSelectionScreen
        {...props}
        navigation={{
          ...props.navigation,
          navigate: mockNavigate
        }}
      />
    ),
    AUTHENTICATION_ROUTES.IDP_SELECTION,
    {},
    store
  );
};

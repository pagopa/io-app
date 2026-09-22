import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as activeSessionLoginAnalytics from "../../../../activeSessionLogin/screens/analytics";
import * as commonAnalytics from "../../../../common/analytics";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import { OneIdentityIdpSelectionFailureContent } from "../OneIdentityIdpSelectionFailureContent";

const mockDismiss = jest.fn();
const mockHandleCieLoginRequested = jest.fn();
jest.mock("../../../../common/hooks/useCieLoginMethodSelection", () => ({
  useCieLoginMethodSelection: () => ({
    bottomSheet: null,
    dismiss: mockDismiss,
    handleCieLoginRequested: mockHandleCieLoginRequested
  })
}));

const mockNavigate = jest.fn();
jest.mock("../../../../../../navigation/params/AppParamsList", () => ({
  ...jest.requireActual("../../../../../../navigation/params/AppParamsList"),
  useIONavigation: () => ({ navigate: mockNavigate })
}));

describe("OneIdentityIdpSelectionFailureContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(commonAnalytics, "trackCieLoginSelected")
      .mockImplementation(jest.fn());
    jest
      .spyOn(
        activeSessionLoginAnalytics,
        "trackLoginReauthEngagementCieSelected"
      )
      .mockImplementation(jest.fn());
  });

  const renderComponent = (isActiveSessionLogin = false) => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    return renderScreenWithNavigationStoreContext(
      () => (
        <OneIdentityIdpSelectionFailureContent
          isActiveSessionLogin={isActiveSessionLogin}
        />
      ),
      AUTHENTICATION_ROUTES.IDP_SELECTION,
      {},
      store
    );
  };

  it("should render the loading error content", () => {
    const { queryByTestId } = renderComponent();

    expect(queryByTestId("idp-loading-error-primary-action")).toBeTruthy();
    expect(queryByTestId("idp-loading-error-secondary-action")).toBeTruthy();
  });

  it("should navigate to the landing screen when pressing the secondary action", () => {
    const { getByTestId } = renderComponent();

    fireEvent.press(getByTestId("idp-loading-error-secondary-action"));

    expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.LANDING
    });
  });

  it("should track trackCieLoginSelected and request the CIE login when pressing the primary action while not in an active session", () => {
    const { getByTestId } = renderComponent();

    fireEvent.press(getByTestId("idp-loading-error-primary-action"));

    expect(commonAnalytics.trackCieLoginSelected).toHaveBeenCalled();
    expect(
      activeSessionLoginAnalytics.trackLoginReauthEngagementCieSelected
    ).not.toHaveBeenCalled();
    expect(mockHandleCieLoginRequested).toHaveBeenCalled();
  });

  it("should track trackLoginReauthEngagementCieSelected and request the CIE login when pressing the primary action during an active session", () => {
    const { getByTestId } = renderComponent(true);

    fireEvent.press(getByTestId("idp-loading-error-primary-action"));

    expect(
      activeSessionLoginAnalytics.trackLoginReauthEngagementCieSelected
    ).toHaveBeenCalled();
    expect(commonAnalytics.trackCieLoginSelected).not.toHaveBeenCalled();
    expect(mockHandleCieLoginRequested).toHaveBeenCalled();
  });
});

import { fireEvent } from "@testing-library/react-native";
import { ComponentProps } from "react";
import { createStore } from "redux";

import { apiUrlPrefix } from "../../../../../../config";
import { useHeaderSecondLevel } from "../../../../../../hooks/useHeaderSecondLevel";
import { applicationChangeState } from "../../../../../../store/actions/application";
import * as IOHooks from "../../../../../../store/hooks";
import { appReducer } from "../../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { AUTH_ERRORS } from "../../../../common/components/AuthErrorComponent";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import { AUTH_LEVELS, AuthLevel } from "../../../../common/utils";
import {
  activeSessionLoginFailure,
  activeSessionLoginSuccess,
  setFinishedActiveSessionLoginFlow
} from "../../../store/actions";
import * as useActiveSessionLoginNavigationModule from "../../../utils/useActiveSessionLoginNavigation";
import { OneIdentityActiveSessionCieIdLoginScreen } from "../OneIdentityActiveSessionCieIdLoginScreen";

jest.mock("../../../../common/components/CieIdWebViewLogin", () => {
  const { View } = require("react-native");

  return {
    CieIdWebViewLogin: (props: any) => (
      <View testID="cie-id-webview-login-mock" {...props} />
    )
  };
});

const mockReplace = jest.fn();
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      replace: mockReplace
    })
  };
});

jest.mock("../../../../../../hooks/useHeaderSecondLevel", () => ({
  useHeaderSecondLevel: jest.fn()
}));

jest.mock("../../../../common/analytics", () => ({
  trackLoginFailure: jest.fn(),
  trackSessionTokenSource: jest.fn(),
  trackSessionTokenFragmentFailure: jest.fn()
}));

jest.mock("../../../../common/analytics/spidAnalytics", () => ({
  trackLoginSpidError: jest.fn()
}));

const MOCK_AUTH_LEVEL_L2: AuthLevel = AUTH_LEVELS.L2;
const MOCK_CALLBACK_URL = `${apiUrlPrefix}/api/auth/v2/callback`;

const mockForceLogoutAndNavigateToLanding = jest.fn();

describe("OneIdentityActiveSessionCieIdLoginScreen", () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(IOHooks, "useIODispatch").mockReturnValue(mockDispatch);

    jest
      .spyOn(useActiveSessionLoginNavigationModule, "default")
      .mockReturnValue({
        navigateToAuthenticationScreen: jest.fn(),
        navigateToCieCardReaderScreen: jest.fn(),
        navigateToCieConsentDataUsage: jest.fn(),
        forceLogoutAndNavigateToLanding: mockForceLogoutAndNavigateToLanding
      });
  });

  it("should render the CieIdWebViewLogin component", () => {
    const { getByTestId } = renderComponent();

    expect(getByTestId("cie-id-webview-login-mock")).toBeTruthy();
  });

  it("should dispatch activeSessionLoginSuccess on LOGIN_SUCCESS event", () => {
    const { getByTestId } = renderComponent();
    const cieIdLoginMock = getByTestId("cie-id-webview-login-mock");

    fireEvent(cieIdLoginMock, "event", {
      type: "LOGIN_SUCCESS",
      payload: { token: "session-token" }
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      activeSessionLoginSuccess("session-token")
    );
  });

  it("should dispatch activeSessionLoginFailure and navigate to AuthErrorScreen on LOGIN_FAILURE event", () => {
    const { getByTestId } = renderComponent();
    const cieIdLoginMock = getByTestId("cie-id-webview-login-mock");

    fireEvent(cieIdLoginMock, "event", {
      type: "LOGIN_FAILURE",
      payload: { code: "err-code", reason: "some-reason" }
    });

    expect(mockDispatch).toHaveBeenCalledWith(activeSessionLoginFailure());
    expect(mockReplace).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
      params: {
        errorCodeOrMessage: "err-code",
        authMethod: "CIE_ID",
        authLevel: MOCK_AUTH_LEVEL_L2,
        params: { spidLevel: MOCK_AUTH_LEVEL_L2, isUat: false }
      }
    });
  });

  it("should not dispatch activeSessionLoginFailure but still navigate to AuthErrorScreen when LOGIN_FAILURE code is ERROR_1004", () => {
    const { getByTestId } = renderComponent();
    const cieIdLoginMock = getByTestId("cie-id-webview-login-mock");

    fireEvent(cieIdLoginMock, "event", {
      type: "LOGIN_FAILURE",
      payload: { code: AUTH_ERRORS.ERROR_1004, reason: "some-reason" }
    });

    expect(mockDispatch).not.toHaveBeenCalledWith(activeSessionLoginFailure());
    expect(mockReplace).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
      params: {
        errorCodeOrMessage: AUTH_ERRORS.ERROR_1004,
        authMethod: "CIE_ID",
        authLevel: MOCK_AUTH_LEVEL_L2,
        params: { spidLevel: MOCK_AUTH_LEVEL_L2, isUat: false }
      }
    });
  });

  it("should force logout and navigate to landing on WEBVIEW_HTTP_ERROR on the callback URL", () => {
    const { getByTestId } = renderComponent();
    const cieIdLoginMock = getByTestId("cie-id-webview-login-mock");

    fireEvent(cieIdLoginMock, "event", {
      type: "WEBVIEW_HTTP_ERROR",
      payload: { url: MOCK_CALLBACK_URL, statusCode: 500 }
    });

    expect(mockForceLogoutAndNavigateToLanding).toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should navigate to AuthErrorScreen on WEBVIEW_HTTP_ERROR outside the callback URL", () => {
    const { getByTestId } = renderComponent();
    const cieIdLoginMock = getByTestId("cie-id-webview-login-mock");

    fireEvent(cieIdLoginMock, "event", {
      type: "WEBVIEW_HTTP_ERROR",
      payload: { url: "https://other.example.com", statusCode: 500 }
    });

    expect(mockForceLogoutAndNavigateToLanding).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
      params: {
        errorCodeOrMessage: undefined,
        authMethod: "CIE_ID",
        authLevel: MOCK_AUTH_LEVEL_L2,
        params: { spidLevel: MOCK_AUTH_LEVEL_L2, isUat: false }
      }
    });
  });

  it("should not navigate anywhere on WEBVIEW_HTTP_ERROR with 403 outside the callback URL", () => {
    const { getByTestId } = renderComponent();
    const cieIdLoginMock = getByTestId("cie-id-webview-login-mock");

    fireEvent(cieIdLoginMock, "event", {
      type: "WEBVIEW_HTTP_ERROR",
      payload: { url: "https://other.example.com", statusCode: 403 }
    });

    expect(mockForceLogoutAndNavigateToLanding).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should navigate to CIE_ID_INCORRECT_URL on NOT_ALLOWED_URL event", () => {
    const { getByTestId } = renderComponent();
    const cieIdLoginMock = getByTestId("cie-id-webview-login-mock");

    fireEvent(cieIdLoginMock, "event", {
      type: "NOT_ALLOWED_URL",
      payload: { url: "https://not-whitelisted.example.com" }
    });

    expect(mockReplace).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_ID_INCORRECT_URL,
      params: { url: "https://not-whitelisted.example.com" }
    });
  });

  it.each(["CANCEL", "ONE_IDENTITY_LOGIN_FAILURE", "WEBVIEW_ERROR"] as const)(
    "should navigate to CIE_ID_ERROR on %s event",
    eventType => {
      const { getByTestId } = renderComponent();
      const cieIdLoginMock = getByTestId("cie-id-webview-login-mock");

      fireEvent(cieIdLoginMock, "event", { type: eventType });

      expect(mockReplace).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.CIE_ID_ERROR
      });
    }
  );

  it("should dispatch setFinishedActiveSessionLoginFlow and popToTop on header goBack", () => {
    const mockPopToTop = jest.fn();

    renderComponent({ popToTop: mockPopToTop });

    const { goBack } = jest.mocked(useHeaderSecondLevel).mock.calls[0][0];

    goBack?.();

    expect(mockDispatch).toHaveBeenCalledWith(
      setFinishedActiveSessionLoginFlow()
    );
    expect(mockPopToTop).toHaveBeenCalled();
  });
});

const renderComponent = (
  navigationOverrides: Partial<
    ComponentProps<
      typeof OneIdentityActiveSessionCieIdLoginScreen
    >["navigation"]
  > = {}
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    (
      props: ComponentProps<typeof OneIdentityActiveSessionCieIdLoginScreen>
    ) => (
      <OneIdentityActiveSessionCieIdLoginScreen
        {...props}
        navigation={{
          ...props.navigation,
          ...navigationOverrides
        }}
      />
    ),
    AUTHENTICATION_ROUTES.CIE_ID_ACTIVE_SESSION_LOGIN,
    { spidLevel: MOCK_AUTH_LEVEL_L2, isUat: false },
    store
  );
};

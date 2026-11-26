import { StackActions } from "@react-navigation/native";
import { fireEvent } from "@testing-library/react-native";
import { ComponentProps } from "react";
import { createStore } from "redux";

import { apiUrlPrefix } from "../../../../../../config";
import { useHeaderSecondLevel } from "../../../../../../hooks/useHeaderSecondLevel";
import { applicationChangeState } from "../../../../../../store/actions/application";
import * as IOHooks from "../../../../../../store/hooks";
import { appReducer } from "../../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { trackLoginFailure } from "../../../../common/analytics";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import { AUTH_LEVELS, AuthLevel } from "../../../../common/utils";
import { AUTH_ERRORS } from "../../../../common/utils/authError";
import {
  getLoginFailureReason,
  LoginFailure
} from "../../../../common/utils/loginFailure";
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
const mockNavigationDispatch = jest.fn();
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      addListener: jest.fn(),
      replace: mockReplace,
      dispatch: mockNavigationDispatch
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
const MOCK_VALID_CALLBACK_URL = `${apiUrlPrefix}/api/auth/v1/callback`;

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

  it("should dispatch activeSessionLoginSuccess on success", () => {
    const { getByTestId } = renderComponent();

    fireEvent(
      getByTestId("cie-id-webview-login-mock"),
      "success",
      "session-token"
    );

    expect(mockDispatch).toHaveBeenCalledWith(
      activeSessionLoginSuccess("session-token")
    );
  });

  it.each<{ failure: LoginFailure; name: string }>([
    {
      name: "a backend failure",
      failure: { kind: "backend", details: { errorCode: "err-code" } }
    },
    {
      name: "a CieID app failure",
      failure: { kind: "cieIdApp", details: { errorCode: "GENERIC_ERROR" } }
    },
    {
      name: "a CieID app not opened",
      failure: {
        kind: "idpAppNotOpened",
        details: { code: "EUNSPECIFIED", url: "CIEID://auth" }
      }
    }
  ])(
    "should dispatch activeSessionLoginFailure, track and navigate to AuthErrorScreen on $name",
    ({ failure }) => {
      const { getByTestId } = renderComponent();

      fireEvent(getByTestId("cie-id-webview-login-mock"), "failure", failure);

      expect(mockDispatch).toHaveBeenCalledWith(activeSessionLoginFailure());
      expect(trackLoginFailure).toHaveBeenCalledWith({
        reason: getLoginFailureReason(failure),
        idp: "cieid",
        flow: "reauth"
      });
      expect(mockNavigationDispatch).toHaveBeenCalledWith(
        authErrorReplaceAction(failure)
      );
      expect(mockReplace).not.toHaveBeenCalled();
    }
  );

  it("should not dispatch activeSessionLoginFailure but still navigate to AuthErrorScreen on the ERROR_1004 backend failure", () => {
    const { getByTestId } = renderComponent();
    const failure: LoginFailure = {
      kind: "backend",
      details: { errorCode: AUTH_ERRORS.ERROR_1004 }
    };

    fireEvent(getByTestId("cie-id-webview-login-mock"), "failure", failure);

    expect(mockDispatch).not.toHaveBeenCalledWith(activeSessionLoginFailure());
    expect(mockNavigationDispatch).toHaveBeenCalledWith(
      authErrorReplaceAction(failure)
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should force logout and navigate to landing on a HTTP error on the callback URL", () => {
    const { getByTestId } = renderComponent();

    fireEvent(getByTestId("cie-id-webview-login-mock"), "failure", {
      kind: "webViewHttp",
      details: {
        description: "",
        statusCode: 500,
        url: MOCK_VALID_CALLBACK_URL
      }
    });

    expect(mockForceLogoutAndNavigateToLanding).toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockNavigationDispatch).not.toHaveBeenCalled();
  });

  // Regression: it used to navigate to AuthErrorScreen, unlike the first login
  // and the legacy active session login
  it("should navigate to CIE_ID_ERROR on a HTTP error that isn't 403 outside the callback URL", () => {
    const { getByTestId } = renderComponent();
    const failure: LoginFailure = {
      kind: "webViewHttp",
      details: {
        description: "",
        statusCode: 500,
        url: "https://other.example.com"
      }
    };

    fireEvent(getByTestId("cie-id-webview-login-mock"), "failure", failure);

    expect(mockForceLogoutAndNavigateToLanding).not.toHaveBeenCalled();
    expect(mockNavigationDispatch).toHaveBeenCalledWith(
      StackActions.replace(AUTHENTICATION_ROUTES.CIE_ID_ERROR, { failure })
    );
    expect(mockNavigationDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          name: AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN
        })
      })
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should not navigate anywhere on a HTTP 403 error outside the callback URL", () => {
    const { getByTestId } = renderComponent();

    fireEvent(getByTestId("cie-id-webview-login-mock"), "failure", {
      kind: "webViewHttp",
      details: {
        description: "",
        statusCode: 403,
        url: "https://other.example.com"
      }
    });

    expect(mockForceLogoutAndNavigateToLanding).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockNavigationDispatch).not.toHaveBeenCalled();
  });

  it("should navigate to CIE_ID_INCORRECT_URL when the CieID app returns a URL not allowed", () => {
    const { getByTestId } = renderComponent();

    fireEvent(getByTestId("cie-id-webview-login-mock"), "failure", {
      kind: "cieIdUrlNotAllowed",
      details: { url: "https://not-whitelisted.example.com" }
    });

    expect(mockNavigationDispatch).toHaveBeenCalledWith(
      StackActions.replace(AUTHENTICATION_ROUTES.CIE_ID_INCORRECT_URL, {
        url: "https://not-whitelisted.example.com"
      })
    );
  });

  it.each<{ failure: LoginFailure; name: string }>([
    { name: "a cancelled login", failure: { kind: "cancelled", details: {} } },
    {
      name: "a login source failure",
      failure: {
        kind: "reserve",
        details: { reason: "some-reason", url: "https://example.com/reserve" }
      }
    },
    {
      name: "a WebView native error",
      failure: {
        kind: "webViewNative",
        details: {
          code: -2,
          description: "net::ERR_INTERNET_DISCONNECTED",
          url: "https://example.com"
        }
      }
    }
  ])(
    "should navigate to CIE_ID_ERROR with the failure on $name",
    ({ failure }) => {
      const { getByTestId } = renderComponent();

      fireEvent(getByTestId("cie-id-webview-login-mock"), "failure", failure);

      expect(mockNavigationDispatch).toHaveBeenCalledWith(
        StackActions.replace(AUTHENTICATION_ROUTES.CIE_ID_ERROR, { failure })
      );
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

const authErrorReplaceAction = (failure: LoginFailure) =>
  StackActions.replace(AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN, {
    authMethod: "CIE_ID",
    authLevel: MOCK_AUTH_LEVEL_L2,
    failure
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
    { spidLevel: MOCK_AUTH_LEVEL_L2 },
    store
  );
};

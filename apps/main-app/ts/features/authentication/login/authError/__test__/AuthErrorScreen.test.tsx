import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { ComponentProps } from "react";
import { BackHandler } from "react-native";
import { createStore } from "redux";

import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import * as hooks from "../../../../../store/hooks";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import {
  setFinishedActiveSessionLoginFlow,
  setRetryActiveSessionLogin
} from "../../../activeSessionLogin/store/actions";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { AUTH_LEVELS } from "../../../common/utils";
import {
  resetSpidLoginState,
  setSpidLoginInLoadingState
} from "../../idp/store/actions";
import AuthErrorScreen, {
  AuthErrorScreenParams
} from "../screens/AuthErrorScreen";

const mockPopTo = jest.fn();
const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockDispatch = jest.fn();

jest.mock("../../../../../store/hooks", () => ({
  useIODispatch: jest.fn(),
  useIOStore: jest.fn(),
  useIOSelector: jest.fn()
}));

jest.spyOn(hooks, "useIODispatch").mockReturnValue(mockDispatch);

const mockUseDebugInfo = jest.fn();
jest.mock("../../../../../hooks/useDebugInfo", () => ({
  useDebugInfo: (data: unknown) => mockUseDebugInfo(data)
}));

const mockRouteParams = jest.fn<{ params: AuthErrorScreenParams }, []>();

describe("AuthErrorScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should forward the raw error code to useDebugInfo for a mapped error", () => {
    mockIsActiveSessionLogin(false);
    mockRouteParams.mockReturnValue({
      params: {
        errorCodeOrMessage: "25",
        authMethod: "SPID",
        authLevel: AUTH_LEVELS.L2
      }
    });

    renderComponent();

    expect(mockUseDebugInfo).toHaveBeenCalledWith({
      errorCodeOrMessage: "25",
      authMethod: "SPID",
      authLevel: AUTH_LEVELS.L2
    });
  });

  it("should forward the raw error code to useDebugInfo for an unmapped error", () => {
    mockIsActiveSessionLogin(false);
    mockRouteParams.mockReturnValue({
      params: {
        errorCodeOrMessage: "some_unmapped_raw_error",
        authMethod: "SPID",
        authLevel: AUTH_LEVELS.L2
      }
    });

    renderComponent();

    expect(mockUseDebugInfo).toHaveBeenCalledWith({
      errorCodeOrMessage: "some_unmapped_raw_error",
      authMethod: "SPID",
      authLevel: AUTH_LEVELS.L2
    });
  });

  it("should add the received failure data to useDebugInfo", () => {
    mockIsActiveSessionLogin(false);
    const failureData = {
      description: "net::ERR_INTERNET_DISCONNECTED",
      code: -2,
      url: "https://example.com/authorize"
    };
    mockRouteParams.mockReturnValue({
      params: { authMethod: "CIE", authLevel: AUTH_LEVELS.L3, failureData }
    });

    renderComponent();

    expect(mockUseDebugInfo).toHaveBeenCalledWith({
      errorCodeOrMessage: undefined,
      authMethod: "CIE",
      authLevel: AUTH_LEVELS.L3,
      ...failureData
    });
  });

  it("rendersCorrectly", () => {
    mockIsActiveSessionLogin(false);
    mockRouteParams.mockReturnValue({
      params: {
        errorCodeOrMessage: "25",
        authMethod: "SPID",
        authLevel: AUTH_LEVELS.L2
      }
    });
    const component = renderComponent();
    expect(
      component.getByText(I18n.t("authentication.auth_errors.error_25.title"))
    ).toBeTruthy();
  });

  describe("onRetry", () => {
    it.each([
      { authMethod: "CIE" as const },
      { authMethod: "CIE_ID" as const },
      { authMethod: "SPID" as const }
    ])(
      "should dispatch setSpidLoginInLoadingState only for SPID ($authMethod)",
      ({ authMethod }) => {
        mockIsActiveSessionLogin(false);
        mockRouteParams.mockReturnValue({
          params: {
            errorCodeOrMessage: "25",
            authMethod,
            authLevel: AUTH_LEVELS.L2
          }
        });

        const { getByTestId } = renderComponent();
        fireEvent.press(getByTestId("retry-button-test-id"));

        if (authMethod === "SPID") {
          expect(mockDispatch).toHaveBeenCalledWith(
            setSpidLoginInLoadingState()
          );
        } else {
          expect(mockDispatch).not.toHaveBeenCalledWith(
            setSpidLoginInLoadingState()
          );
        }
      }
    );

    it("should pop to CIE_PIN_SCREEN for CIE", () => {
      mockIsActiveSessionLogin(false);
      mockRouteParams.mockReturnValue({
        params: {
          errorCodeOrMessage: "25",
          authMethod: "CIE",
          authLevel: AUTH_LEVELS.L2
        }
      });

      const { getByTestId } = renderComponent();
      fireEvent.press(getByTestId("retry-button-test-id"));

      expect(mockPopTo).toHaveBeenCalledWith(
        AUTHENTICATION_ROUTES.CIE_PIN_SCREEN
      );
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("should replace with CIE_ID_LOGIN for CIE_ID in a normal login", () => {
      mockIsActiveSessionLogin(false);
      mockRouteParams.mockReturnValue({
        params: {
          errorCodeOrMessage: "25",
          authMethod: "CIE_ID",
          authLevel: AUTH_LEVELS.L2
        }
      });

      const { getByTestId } = renderComponent();
      fireEvent.press(getByTestId("retry-button-test-id"));

      expect(mockReplace).toHaveBeenCalledWith(
        AUTHENTICATION_ROUTES.CIE_ID_LOGIN
      );
      expect(mockPopTo).not.toHaveBeenCalled();
    });

    it("should replace with CIE_ID_ACTIVE_SESSION_LOGIN for CIE_ID in an active session login", () => {
      mockIsActiveSessionLogin(true);
      mockRouteParams.mockReturnValue({
        params: {
          errorCodeOrMessage: "25",
          authMethod: "CIE_ID",
          authLevel: AUTH_LEVELS.L2
        }
      });

      const { getByTestId } = renderComponent();
      fireEvent.press(getByTestId("retry-button-test-id"));

      expect(mockDispatch).toHaveBeenCalledWith(setRetryActiveSessionLogin());
      expect(mockReplace).toHaveBeenCalledWith(
        AUTHENTICATION_ROUTES.CIE_ID_ACTIVE_SESSION_LOGIN
      );
    });

    it("should pop to IDP_SELECTION for SPID, regardless of active session", () => {
      mockIsActiveSessionLogin(true);
      mockRouteParams.mockReturnValue({
        params: {
          errorCodeOrMessage: "25",
          authMethod: "SPID",
          authLevel: AUTH_LEVELS.L2
        }
      });

      const { getByTestId } = renderComponent();
      fireEvent.press(getByTestId("retry-button-test-id"));

      expect(mockDispatch).toHaveBeenCalledWith(setRetryActiveSessionLogin());
      expect(mockPopTo).toHaveBeenCalledWith(
        AUTHENTICATION_ROUTES.IDP_SELECTION
      );
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe("onCancel", () => {
    it("should pop to LANDING for a normal login", () => {
      mockIsActiveSessionLogin(false);
      mockRouteParams.mockReturnValue({
        params: {
          errorCodeOrMessage: "25",
          authMethod: "SPID",
          authLevel: AUTH_LEVELS.L2
        }
      });

      const { getByTestId } = renderComponent();
      fireEvent.press(getByTestId("cancel-button-test-id"));

      expect(mockDispatch).toHaveBeenCalledWith(resetSpidLoginState());
      expect(mockPopTo).toHaveBeenCalledTimes(1);
      expect(mockPopTo).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.LANDING);
    });

    it("should navigate to the Messages home for an active session login", () => {
      mockIsActiveSessionLogin(true);
      mockRouteParams.mockReturnValue({
        params: {
          errorCodeOrMessage: "25",
          authMethod: "SPID",
          authLevel: AUTH_LEVELS.L2
        }
      });

      const { getByTestId } = renderComponent();
      fireEvent.press(getByTestId("cancel-button-test-id"));

      expect(mockDispatch).toHaveBeenCalledWith(
        setFinishedActiveSessionLoginFlow()
      );
      expect(mockPopTo).toHaveBeenCalledWith(ROUTES.MAIN, {
        screen: MESSAGES_ROUTES.MESSAGES_HOME
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("hardware back button", () => {
    it("should consume the Android back press without navigating, so the user can leave only via Retry or Close", () => {
      const addEventListenerSpy = jest.spyOn(BackHandler, "addEventListener");
      mockIsActiveSessionLogin(false);
      mockRouteParams.mockReturnValue({
        params: {
          errorCodeOrMessage: "25",
          authMethod: "SPID",
          authLevel: AUTH_LEVELS.L2
        }
      });

      renderComponent();

      // Mimics BackHandler: listeners run from the most recent one until
      // one of them consumes the event by returning `true`.
      const isBackPressConsumed = addEventListenerSpy.mock.calls
        .filter(([eventName]) => eventName === "hardwareBackPress")
        .map(([, handler]) => handler)
        .reverse()
        .some(handler => handler() === true);

      expect(isBackPressConsumed).toBe(true);
      expect(mockPopTo).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});

const mockIsActiveSessionLogin = (value: boolean) => {
  jest.spyOn(hooks, "useIOSelector").mockReturnValue(value);
};

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  return renderScreenWithNavigationStoreContext(
    (props: ComponentProps<typeof AuthErrorScreen>) => (
      <AuthErrorScreen
        {...props}
        navigation={
          {
            popTo: mockPopTo,
            navigate: mockNavigate,
            replace: mockReplace
          } as unknown as ComponentProps<typeof AuthErrorScreen>["navigation"]
        }
        route={{
          ...props.route,
          ...mockRouteParams()
        }}
      />
    ),
    AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
    {},
    store
  );
};

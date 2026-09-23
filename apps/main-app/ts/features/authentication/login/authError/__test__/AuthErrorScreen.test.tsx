import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import * as hooks from "../../../../../store/hooks";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import {
  setFinishedActiveSessionLoginFlow,
  setRetryActiveSessionLogin
} from "../../../activeSessionLogin/store/actions";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import {
  resetSpidLoginState,
  setSpidLoginInLoadingState
} from "../../idp/store/actions";
import AuthErrorScreen from "../screens/AuthErrorScreen";

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockReset = jest.fn();
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

const mockUseRoute = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useRoute: () => mockUseRoute(),
    useNavigation: () => ({
      navigate: mockNavigate,
      replace: mockReplace,
      reset: mockReset
    })
  };
});

describe("AuthErrorScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should forward the raw error code and the translated title to useDebugInfo for a mapped error", () => {
    mockIsActiveSessionLogin(false);
    mockUseRoute.mockReturnValue({
      params: {
        errorCodeOrMessage: "25",
        authMethod: "SPID",
        authLevel: "L2"
      }
    });

    renderComponent();

    expect(mockUseDebugInfo).toHaveBeenCalledWith({
      errorCodeOrMessage: "25",
      errorTitle: I18n.t("authentication.auth_errors.error_25.title"),
      authMethod: "SPID",
      authLevel: "L2"
    });
  });

  it("should forward the raw error code and the generic title to useDebugInfo for an unmapped error", () => {
    mockIsActiveSessionLogin(false);
    mockUseRoute.mockReturnValue({
      params: {
        errorCodeOrMessage: "some_unmapped_raw_error",
        authMethod: "SPID",
        authLevel: "L2"
      }
    });

    renderComponent();

    expect(mockUseDebugInfo).toHaveBeenCalledWith({
      errorCodeOrMessage: "some_unmapped_raw_error",
      errorTitle: I18n.t("authentication.auth_errors.generic.title"),
      authMethod: "SPID",
      authLevel: "L2"
    });
  });

  it("rendersCorrectly", () => {
    mockIsActiveSessionLogin(false);
    mockUseRoute.mockReturnValue({
      params: {
        errorCodeOrMessage: 25,
        authMethod: "SPID",
        authLevel: "L2"
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
        mockUseRoute.mockReturnValue({
          params: { errorCodeOrMessage: 25, authMethod, authLevel: "L2" }
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

    it("should navigate locally to CIE_PIN_SCREEN for CIE, without touching MAIN", () => {
      mockIsActiveSessionLogin(false);
      mockUseRoute.mockReturnValue({
        params: { errorCodeOrMessage: 25, authMethod: "CIE", authLevel: "L2" }
      });

      const { getByTestId } = renderComponent();
      fireEvent.press(getByTestId("retry-button-test-id"));

      expect(mockNavigate).toHaveBeenCalledWith(
        AUTHENTICATION_ROUTES.CIE_PIN_SCREEN
      );
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("should replace locally with CIE_ID_LOGIN for CIE_ID in a normal login", () => {
      mockIsActiveSessionLogin(false);
      mockUseRoute.mockReturnValue({
        params: {
          errorCodeOrMessage: 25,
          authMethod: "CIE_ID",
          authLevel: "L2"
        }
      });

      const { getByTestId } = renderComponent();
      fireEvent.press(getByTestId("retry-button-test-id"));

      expect(mockReplace).toHaveBeenCalledWith(
        AUTHENTICATION_ROUTES.CIE_ID_LOGIN
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should replace locally with CIE_ID_ACTIVE_SESSION_LOGIN for CIE_ID in an active session login", () => {
      mockIsActiveSessionLogin(true);
      mockUseRoute.mockReturnValue({
        params: {
          errorCodeOrMessage: 25,
          authMethod: "CIE_ID",
          authLevel: "L2"
        }
      });

      const { getByTestId } = renderComponent();
      fireEvent.press(getByTestId("retry-button-test-id"));

      expect(mockDispatch).toHaveBeenCalledWith(setRetryActiveSessionLogin());
      expect(mockReplace).toHaveBeenCalledWith(
        AUTHENTICATION_ROUTES.CIE_ID_ACTIVE_SESSION_LOGIN
      );
    });

    it("should navigate locally to IDP_SELECTION for SPID, regardless of active session", () => {
      mockIsActiveSessionLogin(true);
      mockUseRoute.mockReturnValue({
        params: { errorCodeOrMessage: 25, authMethod: "SPID", authLevel: "L2" }
      });

      const { getByTestId } = renderComponent();
      fireEvent.press(getByTestId("retry-button-test-id"));

      expect(mockDispatch).toHaveBeenCalledWith(setRetryActiveSessionLogin());
      expect(mockNavigate).toHaveBeenCalledWith(
        AUTHENTICATION_ROUTES.IDP_SELECTION
      );
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe("onCancel", () => {
    it("should reset the local stack to LANDING for a normal login, without touching MAIN", () => {
      mockIsActiveSessionLogin(false);
      mockUseRoute.mockReturnValue({
        params: { errorCodeOrMessage: 25, authMethod: "SPID", authLevel: "L2" }
      });

      const { getByTestId } = renderComponent();
      fireEvent.press(getByTestId("cancel-button-test-id"));

      expect(mockDispatch).toHaveBeenCalledWith(resetSpidLoginState());
      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: AUTHENTICATION_ROUTES.LANDING }]
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should navigate to the Messages home for an active session login", () => {
      mockIsActiveSessionLogin(true);
      mockUseRoute.mockReturnValue({
        params: { errorCodeOrMessage: 25, authMethod: "SPID", authLevel: "L2" }
      });

      const { getByTestId } = renderComponent();
      fireEvent.press(getByTestId("cancel-button-test-id"));

      expect(mockDispatch).toHaveBeenCalledWith(
        setFinishedActiveSessionLoginFlow()
      );
      expect(mockNavigate).toHaveBeenCalled();
      expect(mockReset).not.toHaveBeenCalled();
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
    AuthErrorScreen,
    AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
    {},
    store
  );
};

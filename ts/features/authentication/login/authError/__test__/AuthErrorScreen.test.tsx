import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";

import AuthErrorScreen from "../screens/AuthErrorScreen";
import {
  incrementNativeLoginNativeAttempts,
  resetSpidLoginState,
  setStandardLoginInLoadingState
} from "../../idp/store/actions";

import * as hooks from "../../../../../store/hooks";

const mockNavigation = jest.fn();
const mockDispatch = jest.fn();

jest.mock("../../../../../store/hooks", () => ({
  useIODispatch: jest.fn(),
  useIOStore: jest.fn(),
  useIOSelector: jest.fn()
}));

jest.spyOn(hooks, "useIODispatch").mockReturnValue(mockDispatch);

const mockUseRoute = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useRoute: () => mockUseRoute()
  };
});

jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => ({
    navigate: mockNavigation
  })
}));

describe("AuthErrorScreen", () => {
  it("rendersCorrectly", () => {
    mockUseRoute.mockReturnValue({
      params: {
        errorCodeOrMessage: 25,
        authMethod: "SPID",
        authLevel: "L2",
        isNativeLogin: false
      }
    });
    const component = renderComponent();
    expect(
      component.getByText(I18n.t("authentication.auth_errors.error_25.title"))
    ).toBeTruthy();
  });

  it("should dispatch setStandardLoginInLoadingState and navigate onRetry when not native", () => {
    mockUseRoute.mockReturnValue({
      params: {
        errorCodeOrMessage: 25,
        authMethod: "SPID",
        authLevel: "L2",
        isNativeLogin: false
      }
    });

    const { getByTestId } = renderComponent();

    fireEvent.press(getByTestId("retry-button-test-id"));

    expect(mockDispatch).toHaveBeenCalledWith(setStandardLoginInLoadingState());
    expect(mockNavigation).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.IDP_SELECTION
    });
  });

  it("should dispatch resetSpidLoginState and navigate onCancel", () => {
    mockUseRoute.mockReturnValue({
      params: {
        errorCodeOrMessage: 25,
        authMethod: "SPID",
        authLevel: "L2",
        isNativeLogin: true
      }
    });

    const { getByTestId } = renderComponent();

    fireEvent.press(getByTestId("cancel-button-test-id"));

    expect(mockDispatch).toHaveBeenCalledWith(resetSpidLoginState());
    expect(mockNavigation).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.LANDING
    });
  });

  it("should navigate with params when authMethod is CIE_ID", () => {
    mockUseRoute.mockReturnValue({
      params: {
        errorCodeOrMessage: 25,
        authMethod: "CIE_ID",
        authLevel: "L2",
        params: {
          authorizationUri: "https://example.com",
          ciePin: "123456"
        }
      }
    });

    const { getByTestId } = renderComponent();

    fireEvent.press(getByTestId("retry-button-test-id"));

    expect(mockNavigation).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_ID_LOGIN,
      params: {
        authorizationUri: "https://example.com",
        ciePin: "123456"
      }
    });
  });
  it("should dispatch incrementNativeLoginNativeAttempts if authMethod is SPID and isNativeLogin is true", () => {
    mockUseRoute.mockReturnValue({
      params: {
        errorCodeOrMessage: "Errore",
        authMethod: "SPID",
        authLevel: "L2",
        isNativeLogin: true
      }
    });

    const { getByTestId } = renderComponent();

    fireEvent.press(getByTestId("retry-button-test-id"));

    expect(mockDispatch).toHaveBeenCalledWith(
      incrementNativeLoginNativeAttempts()
    );
    expect(mockNavigation).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.IDP_SELECTION
    });
  });

  it("should dispatch setStandardLoginInLoadingState if authMethod is SPID and isNativeLogin is false", () => {
    mockUseRoute.mockReturnValue({
      params: {
        errorCodeOrMessage: "Errore",
        authMethod: "SPID",
        authLevel: "L2",
        isNativeLogin: false
      }
    });

    const { getByTestId } = renderComponent();

    fireEvent.press(getByTestId("retry-button-test-id"));

    expect(mockDispatch).toHaveBeenCalledWith(setStandardLoginInLoadingState());
    expect(mockNavigation).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.IDP_SELECTION
    });
  });
});

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

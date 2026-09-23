import { StackActions } from "@react-navigation/native";
import { renderHook } from "@testing-library/react-native";

import { AUTHENTICATION_ROUTES } from "../../navigation/routes";
import { AUTH_LEVELS } from "../../utils";
import { useCieIdWebViewLoginNavigation } from "../useCieIdWebViewLoginNavigation";

const mockReplace = jest.fn();
const mockDispatch = jest.fn();
const mockSelector = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      replace: mockReplace,
      dispatch: mockDispatch
    })
  };
});

jest.mock("../../../../../store/hooks", () => ({
  useIOSelector: mockSelector
}));

describe("useCieIdWebViewLoginNavigation", () => {
  const authLevel = AUTH_LEVELS.L2;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("navigateToCieIdAuthenticationError should replace with CIE_ID_ERROR", () => {
    const { result } = renderHook(() =>
      useCieIdWebViewLoginNavigation({ authLevel })
    );

    result.current.navigateToCieIdAuthenticationError();

    expect(mockReplace).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_ID_ERROR
    });
  });

  it("navigateToCieIdAuthUrlError should replace with CIE_ID_INCORRECT_URL and the url param", () => {
    const { result } = renderHook(() =>
      useCieIdWebViewLoginNavigation({ authLevel })
    );

    result.current.navigateToCieIdAuthUrlError("https://untrusted.example.com");

    expect(mockReplace).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_ID_INCORRECT_URL,
      params: { url: "https://untrusted.example.com" }
    });
  });

  it("navigateToAuthErrorScreen should locally dispatch a replace to AUTH_ERROR_SCREEN with the CIE_ID context parameters, without touching MAIN", () => {
    const { result } = renderHook(() =>
      useCieIdWebViewLoginNavigation({ authLevel })
    );

    result.current.navigateToAuthErrorScreen("err-code");

    expect(mockDispatch).toHaveBeenCalledWith(
      StackActions.replace(AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN, {
        errorCodeOrMessage: "err-code",
        authMethod: "CIE_ID",
        authLevel
      })
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });
});

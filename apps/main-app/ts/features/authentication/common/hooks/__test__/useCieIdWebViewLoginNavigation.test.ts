import { renderHook } from "@testing-library/react-native";

import { AUTHENTICATION_ROUTES } from "../../navigation/routes";
import { AUTH_LEVELS } from "../../utils";
import { useCieIdWebViewLoginNavigation } from "../useCieIdWebViewLoginNavigation";

const mockReplace = jest.fn();
const mockSelector = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      replace: mockReplace
    })
  };
});

jest.mock("../../../../../store/hooks", () => ({
  useIOSelector: mockSelector
}));

describe("useCieIdWebViewLoginNavigation", () => {
  const authLevel = AUTH_LEVELS.L2;
  const isUat = false;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("navigateToCieIdAuthenticationError should replace with CIE_ID_ERROR", () => {
    const { result } = renderHook(() =>
      useCieIdWebViewLoginNavigation({ authLevel, isUat })
    );

    result.current.navigateToCieIdAuthenticationError();

    expect(mockReplace).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_ID_ERROR
    });
  });

  it("navigateToCieIdAuthUrlError should replace with CIE_ID_INCORRECT_URL and the url param", () => {
    const { result } = renderHook(() =>
      useCieIdWebViewLoginNavigation({ authLevel, isUat })
    );

    result.current.navigateToCieIdAuthUrlError("https://untrusted.example.com");

    expect(mockReplace).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_ID_INCORRECT_URL,
      params: { url: "https://untrusted.example.com" }
    });
  });

  it("navigateToAuthErrorScreen should replace with AUTH_ERROR_SCREEN and the CIE_ID context parameters", () => {
    const { result } = renderHook(() =>
      useCieIdWebViewLoginNavigation({ authLevel, isUat })
    );

    result.current.navigateToAuthErrorScreen("err-code");

    expect(mockReplace).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
      params: {
        errorCodeOrMessage: "err-code",
        authMethod: "CIE_ID",
        authLevel,
        params: { spidLevel: authLevel, isUat }
      }
    });
  });
});

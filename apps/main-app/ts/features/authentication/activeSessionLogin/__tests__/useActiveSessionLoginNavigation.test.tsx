import { act, renderHook } from "@testing-library/react-native";
import useActiveSessionLoginNavigation from "../utils/useActiveSessionLoginNavigation";
import { AUTHENTICATION_ROUTES } from "../../common/navigation/routes";
import { setFinishedActiveSessionLoginFlow } from "../store/actions";
import ROUTES from "../../../../navigation/routes";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";

// Mock dependencies
const mockPopToTop = jest.fn();
const mockReset = jest.fn();
const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
const mockSelector = jest.fn();

jest.mock("../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => ({
    popToTop: mockPopToTop,
    reset: mockReset,
    navigate: mockNavigate
  })
}));

jest.mock("../../../../store/hooks", () => ({
  useIODispatch: () => mockDispatch,
  useIOSelector: (selector: any) => mockSelector(selector)
}));

describe("useActiveSessionLoginNavigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("navigateToAuthenticationScreen - active session", () => {
    mockSelector.mockReturnValue(true);

    const { result } = renderHook(() => useActiveSessionLoginNavigation());

    act(() => {
      result.current.navigateToAuthenticationScreen();
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      setFinishedActiveSessionLoginFlow()
    );
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.MAIN, {
      screen: MESSAGES_ROUTES.MESSAGES_HOME
    });
    expect(mockReset).not.toHaveBeenCalled();
  });

  it("navigateToAuthenticationScreen - not active session", () => {
    mockSelector.mockReturnValue(false);

    const { result } = renderHook(() => useActiveSessionLoginNavigation());

    act(() => {
      result.current.navigateToAuthenticationScreen();
    });

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockReset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: AUTHENTICATION_ROUTES.MAIN }]
    });
  });

  it("navigateToCieCardReaderScreen - active session", () => {
    mockSelector.mockReturnValue(true);

    const { result } = renderHook(() => useActiveSessionLoginNavigation());

    act(() => {
      result.current.navigateToCieCardReaderScreen({
        ciePin: "1234",
        authorizationUri: "auth-uri"
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_CARD_READER_SCREEN_ACTIVE_SESSION_LOGIN,
      params: {
        ciePin: "1234",
        authorizationUri: "auth-uri"
      }
    });
  });

  it("navigateToCieCardReaderScreen - not active session", () => {
    mockSelector.mockReturnValue(false);

    const { result } = renderHook(() => useActiveSessionLoginNavigation());

    act(() => {
      result.current.navigateToCieCardReaderScreen({
        ciePin: "5678",
        authorizationUri: "other-uri"
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_CARD_READER_SCREEN,
      params: {
        ciePin: "5678",
        authorizationUri: "other-uri"
      }
    });
  });

  it("navigateToCieConsentDataUsage - active session", () => {
    mockSelector.mockReturnValue(true);

    const { result } = renderHook(() => useActiveSessionLoginNavigation());

    act(() => {
      result.current.navigateToCieConsentDataUsage({
        cieConsentUri: "consent-uri"
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_CONSENT_DATA_USAGE_ACTIVE_SESSION_LOGIN,
      params: {
        cieConsentUri: "consent-uri"
      }
    });
  });

  it("navigateToCieConsentDataUsage - not active session", () => {
    mockSelector.mockReturnValue(false);

    const { result } = renderHook(() => useActiveSessionLoginNavigation());

    act(() => {
      result.current.navigateToCieConsentDataUsage({
        cieConsentUri: "other-consent-uri"
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_CONSENT_DATA_USAGE,
      params: {
        cieConsentUri: "other-consent-uri"
      }
    });
  });
});

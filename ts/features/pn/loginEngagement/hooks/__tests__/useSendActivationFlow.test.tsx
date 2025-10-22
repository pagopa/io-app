import { renderHook, act } from "@testing-library/react-native";
import { useIOToast } from "@pagopa/io-app-design-system";
import i18n from "i18next";
import { useSendActivationFlow } from "../useSendActivationFlow";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../../store/hooks";
import { pnActivationUpsert } from "../../../store/actions";
import { setSendEngagementScreenHasBeenDismissed } from "../../store/actions";
import { isLoadingPnActivationSelector } from "../../../store/reducers/activation";
import { areNotificationPermissionsEnabledSelector } from "../../../../pushNotifications/store/reducers/environment";
import { NOTIFICATIONS_ROUTES } from "../../../../pushNotifications/navigation/routes";
import { setSecurityAdviceReadyToShow } from "../../../../authentication/fastLogin/store/actions/securityAdviceActions";

jest.mock("../../../store/reducers/activation", () => ({
  isLoadingPnActivationSelector: jest.fn()
}));
jest.mock("../../../../pushNotifications/store/reducers/environment", () => ({
  areNotificationPermissionsEnabledSelector: jest.fn()
}));

jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: jest.fn()
}));

jest.mock("../../../../../store/hooks", () => ({
  useIODispatch: jest.fn(),
  useIOSelector: (fn: () => any) => fn()
}));

jest.mock("@pagopa/io-app-design-system", () => ({
  useIOToast: jest.fn()
}));

const mockPopToTop = jest.fn();
const mockReplace = jest.fn();
const mockDispatch = jest.fn();
const mockToastSuccess = jest.fn();
const mockIsLoadingPnActivationSelector =
  isLoadingPnActivationSelector as jest.Mock;
const mockAreNotificationPermissionsEnabledSelector =
  areNotificationPermissionsEnabledSelector as jest.Mock;

const mockUseIONavigation = useIONavigation as jest.Mock;
const mockUseIODispatch = useIODispatch as jest.Mock;
const mockUseIOToast = useIOToast as jest.Mock;

describe(useSendActivationFlow, () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIONavigation.mockReturnValue({
      popToTop: mockPopToTop,
      replace: mockReplace
    });
    mockUseIODispatch.mockReturnValue(mockDispatch);
    mockUseIOToast.mockReturnValue({ success: mockToastSuccess });
  });

  it("should return the initial state correctly", () => {
    mockIsLoadingPnActivationSelector.mockReturnValue(false);
    const { result } = renderHook(() => useSendActivationFlow());

    expect(result.current.isActivating).toBe(false);
    expect(typeof result.current.requestSendActivation).toBe("function");
  });

  it("should return isActivating as true when selector returns true", () => {
    mockIsLoadingPnActivationSelector.mockReturnValue(true);
    const { result } = renderHook(() => useSendActivationFlow());

    expect(result.current.isActivating).toBe(true);
  });

  it("should dispatch pnActivationUpsert.request when requestSendActivation is called", () => {
    mockIsLoadingPnActivationSelector.mockReturnValue(false);
    const { result } = renderHook(() => useSendActivationFlow());

    act(() => {
      result.current.requestSendActivation();
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      pnActivationUpsert.request({
        value: true,
        onSuccess: expect.any(Function),
        onFailure: expect.any(Function)
      })
    );
  });

  it("should handle the success callback correctly and call toastSuccess and popToTop", () => {
    mockIsLoadingPnActivationSelector.mockReturnValue(false);
    mockAreNotificationPermissionsEnabledSelector.mockReturnValue(true);

    const { result } = renderHook(() => useSendActivationFlow());

    act(() => {
      result.current.requestSendActivation();
    });

    // Simulate the success callback
    const successCallback = mockDispatch.mock.calls[0][0].payload.onSuccess;
    act(() => {
      successCallback();
    });

    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockPopToTop).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      setSendEngagementScreenHasBeenDismissed()
    );
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledWith(
      i18n.t("features.pn.loginEngagement.send.toast")
    );
  });

  it("should handle the success callback correctly and call replace with the right params", () => {
    mockIsLoadingPnActivationSelector.mockReturnValue(false);
    mockAreNotificationPermissionsEnabledSelector.mockReturnValue(false);

    const { result } = renderHook(() => useSendActivationFlow());

    act(() => {
      result.current.requestSendActivation();
    });

    // Simulate the success callback
    const successCallback = mockDispatch.mock.calls[0][0].payload.onSuccess;
    act(() => {
      successCallback();
    });

    expect(mockPopToTop).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith(
      NOTIFICATIONS_ROUTES.PUSH_NOTIFICATION_ENGAGEMENT,
      {
        flow: "access",
        sendOpeningSource: "not_set",
        sendUserType: "not_set"
      }
    );
    expect(mockDispatch).toHaveBeenCalledTimes(3);
    expect(mockDispatch).toHaveBeenCalledWith(
      setSendEngagementScreenHasBeenDismissed()
    );
    expect(mockDispatch).toHaveBeenCalledWith(
      setSecurityAdviceReadyToShow(true)
    );
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledWith(
      i18n.t("features.pn.loginEngagement.send.toast")
    );
  });

  it("should handle the failure callback correctly", () => {
    const { result } = renderHook(() => useSendActivationFlow());

    act(() => {
      result.current.requestSendActivation();
    });

    // Simulate the failure callback
    const failureCallback = mockDispatch.mock.calls[0][0].payload.onFailure;
    act(() => {
      failureCallback();
    });

    expect(mockPopToTop).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).not.toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });
});

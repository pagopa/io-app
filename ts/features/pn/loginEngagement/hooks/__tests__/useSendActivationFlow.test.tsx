import { renderHook, act } from "@testing-library/react-native";
import { useIOToast } from "@pagopa/io-app-design-system";
import i18n from "i18next";
import { useSendActivationFlow } from "../useSendActivationFlow";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { pnActivationUpsert } from "../../../store/actions";
import { setSendEngagementScreenHasBeenDismissed } from "../../store/actions";
import { setSecurityAdviceReadyToShow } from "../../../../authentication/fastLogin/store/actions/securityAdviceActions";

jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: jest.fn()
}));

jest.mock("../../../../../store/hooks", () => ({
  useIODispatch: jest.fn(),
  useIOSelector: jest.fn()
}));

jest.mock("@pagopa/io-app-design-system", () => ({
  useIOToast: jest.fn()
}));

const mockPop = jest.fn();
const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
const mockToastSuccess = jest.fn();

const mockUseIONavigation = useIONavigation as jest.Mock;
const mockUseIODispatch = useIODispatch as jest.Mock;
const mockUseIOSelector = useIOSelector as jest.Mock;
const mockUseIOToast = useIOToast as jest.Mock;

describe(useSendActivationFlow, () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIONavigation.mockReturnValue({
      pop: mockPop,
      navigate: mockNavigate
    });
    mockUseIODispatch.mockReturnValue(mockDispatch);
    mockUseIOToast.mockReturnValue({ success: mockToastSuccess });
  });

  it("should return the initial state correctly", () => {
    mockUseIOSelector.mockReturnValue(false);
    const { result } = renderHook(() => useSendActivationFlow());

    expect(result.current.isActivating).toBe(false);
    expect(typeof result.current.requestSendActivation).toBe("function");
  });

  it("should return isActivating as true when selector returns true", () => {
    mockUseIOSelector.mockReturnValue(true);
    const { result } = renderHook(() => useSendActivationFlow());

    expect(result.current.isActivating).toBe(true);
  });

  it("should dispatch pnActivationUpsert.request when requestSendActivation is called", () => {
    mockUseIOSelector.mockReturnValue(false);
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

  it("should handle the success callback correctly", () => {
    const { result } = renderHook(() => useSendActivationFlow());

    act(() => {
      result.current.requestSendActivation();
    });

    // Simulate the success callback
    const successCallback = mockDispatch.mock.calls[0][0].payload.onSuccess;
    act(() => {
      successCallback();
    });

    expect(mockPop).toHaveBeenCalledTimes(1);
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

    expect(mockPop).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).not.toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });
});

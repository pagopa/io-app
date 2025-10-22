import { useFocusEffect } from "@react-navigation/native";
import {
  renderHook,
  act,
  render,
  fireEvent
} from "@testing-library/react-native";
import i18n from "i18next";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { useSendAreYouSureBottomSheet } from "../useSendAreYouSureBottomSheet";
import {
  trackSendActivationAccepted,
  trackSendActivationDeclined,
  trackSendNurturingDialogClosure
} from "../../../analytics/send";

const mockRequestSendActivation = jest.fn();

jest.mock("../../../../../store/reducers/preferences", () => ({
  isScreenReaderEnabledSelector: () => false
}));

jest.mock("../../../../../utils/hooks/bottomSheet", () => ({
  useIOBottomSheetModal: jest.fn()
}));

jest.mock("../../../../../store/reducers/backendStatus/remoteConfig", () => ({
  ...jest.requireActual(
    "../../../../../store/reducers/backendStatus/remoteConfig"
  ),
  pnPrivacyUrlsSelector: jest
    .fn()
    .mockReturnValue({ tos: "TOS_URL", privacy: "PRIVACY_URL" })
}));

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: jest.fn(),
  useNavigation: jest.fn().mockReturnValue({ pop: jest.fn() })
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn().mockReturnValue({ bottom: 0 })
}));

jest.mock("@react-navigation/stack", () => ({ createStackNavigator: jest.fn }));

jest.mock("react-redux", () => ({
  useDispatch: jest.fn().mockImplementation(jest.fn),
  useSelector: jest.fn().mockImplementation(fn => fn())
}));

jest.mock("../useSendActivationFlow", () => ({
  useSendActivationFlow: () => ({
    requestSendActivation: mockRequestSendActivation,
    isActivating: false
  })
}));

jest.mock("../../../analytics/send", () => ({
  trackSendNurturingDialogClosure: jest.fn(),
  trackSendActivationDeclined: jest.fn(),
  trackSendActivationAccepted: jest.fn()
}));

const useIOBottomSheetModalMock = useIOBottomSheetModal as jest.Mock;
const useFocusEffectMock = useFocusEffect as jest.Mock;

describe(useSendAreYouSureBottomSheet, () => {
  const mockPresent = jest.fn();
  const mockDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useIOBottomSheetModalMock.mockImplementation(props => {
      const { useIOBottomSheetModal: useTestBottomSheetModal } =
        jest.requireActual("../../../../../utils/hooks/bottomSheet");
      const { bottomSheet } = useTestBottomSheetModal(props);

      return {
        bottomSheet,
        present: mockPresent,
        dismiss: mockDismiss
      };
    });
    useFocusEffectMock.mockImplementation(callback => {
      const cleanup = callback();
      if (cleanup) {
        cleanup();
      }
    });
  });

  it("should match the snapshot", () => {
    const { result } = renderHook(() => useSendAreYouSureBottomSheet());

    expect(result.current.areYouSureBottomSheet).toMatchSnapshot();
  });

  it("should return the bottom sheet component and the present function", () => {
    const { result } = renderHook(() => useSendAreYouSureBottomSheet());

    expect(typeof result.current.presentAreYouSureBottomSheet).toBe("function");
    expect(mockRequestSendActivation).not.toHaveBeenCalled();
    expect(trackSendActivationAccepted).not.toHaveBeenCalled();
    expect(trackSendActivationDeclined).not.toHaveBeenCalled();
    expect(trackSendNurturingDialogClosure).not.toHaveBeenCalled();
  });

  it("should call present when presentAreYouSureBottomSheet is invoked", () => {
    const { result } = renderHook(() => useSendAreYouSureBottomSheet());

    act(() => {
      result.current.presentAreYouSureBottomSheet();
    });

    expect(mockPresent).toHaveBeenCalledTimes(1);
    expect(mockRequestSendActivation).not.toHaveBeenCalled();
    expect(trackSendActivationAccepted).not.toHaveBeenCalled();
    expect(trackSendActivationDeclined).not.toHaveBeenCalled();
    expect(trackSendNurturingDialogClosure).not.toHaveBeenCalled();
  });

  it("should configure the bottom sheet with the correct title and component", () => {
    renderHook(() => useSendAreYouSureBottomSheet());

    expect(useIOBottomSheetModalMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: i18n.t(
          "features.pn.loginEngagement.send.areYouSureBottomSheet.title"
        )
      })
    );

    const { component } = useIOBottomSheetModalMock.mock.calls[0][0];
    expect(component).toBeDefined();
    expect(mockRequestSendActivation).not.toHaveBeenCalled();
    expect(trackSendActivationAccepted).not.toHaveBeenCalled();
    expect(trackSendActivationDeclined).not.toHaveBeenCalled();
    expect(trackSendNurturingDialogClosure).not.toHaveBeenCalled();
  });

  it("should call dismiss on focus effect cleanup", () => {
    // Reset mock implementation for this specific test to avoid immediate cleanup
    useFocusEffectMock.mockImplementation(callback => {
      // Store the cleanup function but don't call it yet
      const cleanup = callback();
      // To simulate the cleanup later, we can return it or call it in a controlled way
      // For this test, we just want to ensure the cleanup function is `dismiss`
      expect(cleanup).toBe(mockDismiss);
    });

    renderHook(() => useSendAreYouSureBottomSheet());

    // The assertion is inside the mock implementation
    expect.assertions(1);
  });

  it("should call useFocusEffect with a memoized callback", () => {
    // This test verifies that the callback passed to useFocusEffect is memoized,
    // which implies its dependencies (like `dismiss`) are stable.
    const { rerender } = renderHook(() => useSendAreYouSureBottomSheet());
    const firstRenderEffectCallback = useFocusEffectMock.mock.calls[0][0];

    // Rerender with no new props
    rerender(undefined);

    const secondRenderEffectCallback = useFocusEffectMock.mock.calls[1][0];

    // If the dependency (dismiss) hasn't changed, the callback function should be the same instance
    expect(firstRenderEffectCallback).toBe(secondRenderEffectCallback);
    expect(mockRequestSendActivation).not.toHaveBeenCalled();
    expect(trackSendActivationAccepted).not.toHaveBeenCalled();
    expect(trackSendActivationDeclined).not.toHaveBeenCalled();
    expect(trackSendNurturingDialogClosure).not.toHaveBeenCalled();
  });

  it("should not call trackSendNurturingDialogClosure on dismiss if send activation CTA was pressed", () => {
    const { result } = renderHook(() => useSendAreYouSureBottomSheet());
    const { getByTestId } = render(<>{result.current.areYouSureBottomSheet}</>);
    const { onDismiss } = useIOBottomSheetModalMock.mock.calls[0][0];

    // Simulate pressing the CTA button
    const sendActivationCTA = getByTestId("sendActivationID");

    fireEvent.press(sendActivationCTA);

    expect(trackSendActivationAccepted).toHaveBeenCalledWith(
      "nurturing_bottomsheet",
      "access"
    );
    expect(mockRequestSendActivation).toHaveBeenCalledTimes(1);

    // Simulate dismissing the bottom sheet
    act(() => {
      onDismiss();
    });

    expect(trackSendActivationDeclined).not.toHaveBeenCalled();
    expect(trackSendNurturingDialogClosure).not.toHaveBeenCalled();
  });

  it("should not call trackSendNurturingDialogClosure on dismiss if send dismissal CTA was pressed", () => {
    const { result } = renderHook(() => useSendAreYouSureBottomSheet());
    const { getByTestId } = render(<>{result.current.areYouSureBottomSheet}</>);
    const { onDismiss } = useIOBottomSheetModalMock.mock.calls[0][0];

    // Simulate pressing the CTA button
    const sendDismissalCTA = getByTestId("sendDismissalID");

    fireEvent.press(sendDismissalCTA);

    expect(trackSendActivationDeclined).toHaveBeenCalledWith("access");

    // Simulate dismissing the bottom sheet
    act(() => {
      onDismiss();
    });

    expect(mockRequestSendActivation).not.toHaveBeenCalled();
    expect(trackSendActivationAccepted).not.toHaveBeenCalled();
    expect(trackSendNurturingDialogClosure).not.toHaveBeenCalled();
  });

  it("should call trackSendNurturingDialogClosure on dismiss", () => {
    renderHook(() => useSendAreYouSureBottomSheet());
    const { onDismiss } = useIOBottomSheetModalMock.mock.calls[0][0];

    // Simulate dismissing the bottom sheet
    act(() => {
      onDismiss();
    });

    expect(trackSendActivationAccepted).not.toHaveBeenCalled();
    expect(mockRequestSendActivation).not.toHaveBeenCalled();
    expect(trackSendNurturingDialogClosure).toHaveBeenCalledTimes(1);
    expect(trackSendNurturingDialogClosure).toHaveBeenCalledWith("access");
  });
});

import { fireEvent, render } from "@testing-library/react-native";
import { SendEngagementOnFirstAppOpenScreen } from "../SendEngagementOnFirstAppOpenScreen";
import {
  trackSendAcceptanceDialog,
  trackSendActivationModalDialog,
  trackSendActivationModalDialogActivationStart,
  trackSendActivationModalDialogActivationDismissed,
  trackSendNurturingDialog
} from "../../../analytics/send";
import { NotificationModalFlow } from "../../../../pushNotifications/analytics";

const testFlow: NotificationModalFlow = "access";

const mockPresentActivationBottomSheet = jest.fn();
const mockPresentAreYouSureBottomSheet = jest.fn();

jest.mock("react-redux", () => ({
  // This mock was added to override the selector used in the `IOMarkdown` component
  useSelector: jest.fn().mockReturnValue(false)
}));

jest.mock("../../hooks/useSendActivationBottomSheet", () => ({
  useSendActivationBottomSheet() {
    return {
      activationBottomSheet: jest.fn(),
      presentActivationBottomSheet: mockPresentActivationBottomSheet
    };
  }
}));

jest.mock("../../hooks/useSendAreYouSureBottomSheet", () => ({
  useSendAreYouSureBottomSheet() {
    return {
      areYouSureBottomSheet: jest.fn(),
      presentAreYouSureBottomSheet: mockPresentAreYouSureBottomSheet
    };
  }
}));

jest.mock("../../../analytics/send", () => ({
  trackSendActivationModalDialog: jest.fn(),
  trackSendActivationModalDialogActivationStart: jest.fn(),
  trackSendAcceptanceDialog: jest.fn(),
  trackSendActivationModalDialogActivationDismissed: jest.fn(),
  trackSendNurturingDialog: jest.fn()
}));

describe(SendEngagementOnFirstAppOpenScreen, () => {
  beforeEach(jest.clearAllMocks);

  it("should match the snapshot", () => {
    const component = render(<SendEngagementOnFirstAppOpenScreen />);

    expect(component).toMatchSnapshot();
  });
  it("should properly call presentActivationBottomSheet", () => {
    const { getByTestId } = render(<SendEngagementOnFirstAppOpenScreen />);

    const presentActivationBottomSheet = getByTestId(
      "sendEngagementOnFirstAppOpenActionID"
    );
    fireEvent.press(presentActivationBottomSheet);

    expect(trackSendActivationModalDialog).toHaveBeenCalledTimes(1);
    expect(trackSendActivationModalDialog).toHaveBeenCalledWith(testFlow);
    expect(mockPresentActivationBottomSheet).toHaveBeenCalledTimes(1);
    expect(trackSendActivationModalDialogActivationStart).toHaveBeenCalledTimes(
      1
    );
    expect(trackSendActivationModalDialogActivationStart).toHaveBeenCalledWith(
      testFlow
    );
    expect(trackSendAcceptanceDialog).toHaveBeenCalledTimes(1);
    expect(trackSendAcceptanceDialog).toHaveBeenCalledWith(testFlow);
    expect(
      trackSendActivationModalDialogActivationDismissed
    ).not.toHaveBeenCalled();
    expect(trackSendNurturingDialog).not.toHaveBeenCalled();
    expect(mockPresentAreYouSureBottomSheet).not.toHaveBeenCalled();
  });
  it("should properly call presentAreYouSureBottomSheet", () => {
    const { getByTestId } = render(<SendEngagementOnFirstAppOpenScreen />);

    const presentActivationBottomSheet = getByTestId(
      "sendEngagementOnFirstAppOpenSecondaryActionID"
    );
    fireEvent.press(presentActivationBottomSheet);

    expect(trackSendActivationModalDialog).toHaveBeenCalledTimes(1);
    expect(trackSendActivationModalDialog).toHaveBeenCalledWith(testFlow);
    expect(mockPresentAreYouSureBottomSheet).toHaveBeenCalledTimes(1);
    expect(
      trackSendActivationModalDialogActivationDismissed
    ).toHaveBeenCalledTimes(1);
    expect(
      trackSendActivationModalDialogActivationDismissed
    ).toHaveBeenCalledWith(testFlow);
    expect(trackSendNurturingDialog).toHaveBeenCalledTimes(1);
    expect(trackSendNurturingDialog).toHaveBeenCalledWith(testFlow);
    expect(
      trackSendActivationModalDialogActivationStart
    ).not.toHaveBeenCalled();
    expect(trackSendAcceptanceDialog).not.toHaveBeenCalled();
    expect(mockPresentActivationBottomSheet).not.toHaveBeenCalled();
  });
});

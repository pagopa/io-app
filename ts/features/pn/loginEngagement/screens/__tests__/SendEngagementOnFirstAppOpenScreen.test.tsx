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

// Event tracking functions mocks
const mockTrackSendActivationModalDialog =
  trackSendActivationModalDialog as jest.Mock;
const mockTrackSendActivationModalDialogActivationStart =
  trackSendActivationModalDialogActivationStart as jest.Mock;
const mockTrackSendAcceptanceDialog = trackSendAcceptanceDialog as jest.Mock;
const mockTrackSendActivationModalDialogActivationDismissed =
  trackSendActivationModalDialogActivationDismissed as jest.Mock;
const mockTrackSendNurturingDialog = trackSendNurturingDialog as jest.Mock;

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

    expect(mockTrackSendActivationModalDialog).toHaveBeenCalledTimes(1);
    expect(mockTrackSendActivationModalDialog).toHaveBeenCalledWith(testFlow);
    expect(mockPresentActivationBottomSheet).toHaveBeenCalledTimes(1);
    expect(
      mockTrackSendActivationModalDialogActivationStart
    ).toHaveBeenCalledTimes(1);
    expect(
      mockTrackSendActivationModalDialogActivationStart
    ).toHaveBeenCalledWith(testFlow);
    expect(mockTrackSendAcceptanceDialog).toHaveBeenCalledTimes(1);
    expect(mockTrackSendAcceptanceDialog).toHaveBeenCalledWith(testFlow);
    expect(
      mockTrackSendActivationModalDialogActivationDismissed
    ).not.toHaveBeenCalled();
    expect(mockTrackSendNurturingDialog).not.toHaveBeenCalled();
    expect(mockPresentAreYouSureBottomSheet).not.toHaveBeenCalled();
  });
  it("should properly call presentAreYouSureBottomSheet", () => {
    const { getByTestId } = render(<SendEngagementOnFirstAppOpenScreen />);

    const presentActivationBottomSheet = getByTestId(
      "sendEngagementOnFirstAppOpenSecondaryActionID"
    );
    fireEvent.press(presentActivationBottomSheet);

    expect(mockTrackSendActivationModalDialog).toHaveBeenCalledTimes(1);
    expect(mockTrackSendActivationModalDialog).toHaveBeenCalledWith(testFlow);
    expect(mockPresentAreYouSureBottomSheet).toHaveBeenCalledTimes(1);
    expect(
      mockTrackSendActivationModalDialogActivationDismissed
    ).toHaveBeenCalledTimes(1);
    expect(
      mockTrackSendActivationModalDialogActivationDismissed
    ).toHaveBeenCalledWith(testFlow);
    expect(mockTrackSendNurturingDialog).toHaveBeenCalledTimes(1);
    expect(mockTrackSendNurturingDialog).toHaveBeenCalledWith(testFlow);
    expect(
      mockTrackSendActivationModalDialogActivationStart
    ).not.toHaveBeenCalled();
    expect(mockTrackSendAcceptanceDialog).not.toHaveBeenCalled();
    expect(mockPresentActivationBottomSheet).not.toHaveBeenCalled();
  });
});

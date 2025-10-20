import { fireEvent, render } from "@testing-library/react-native";
import { SendEngagementOnFirstAppOpenScreen } from "../SendEngagementOnFirstAppOpenScreen";

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

    expect(mockPresentActivationBottomSheet).toHaveBeenCalledTimes(1);
    expect(mockPresentAreYouSureBottomSheet).not.toHaveBeenCalled();
  });
  it("should properly call presentAreYouSureBottomSheet", () => {
    const { getByTestId } = render(<SendEngagementOnFirstAppOpenScreen />);

    const presentActivationBottomSheet = getByTestId(
      "sendEngagementOnFirstAppOpenSecondaryActionID"
    );
    fireEvent.press(presentActivationBottomSheet);

    expect(mockPresentAreYouSureBottomSheet).toHaveBeenCalledTimes(1);
    expect(mockPresentActivationBottomSheet).not.toHaveBeenCalled();
  });
});

import { fireEvent, render } from "@testing-library/react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { SendActivationErrorScreen } from "../SendActivationErrorScreen";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import PN_ROUTES from "../../../navigation/routes";
import ROUTES from "../../../../../navigation/routes";

const mockReplace = jest.fn();
const mockDispatch = jest.fn();

jest.mock("@react-navigation/stack", () => ({
  createStackNavigator: jest.fn()
}));
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn()
}));
jest.mock("react-redux", () => ({
  useDispatch: jest.fn()
}));

const mockUseNavigation = useNavigation as jest.Mock;
const mockUseDispatch = useDispatch as jest.Mock;

describe(SendActivationErrorScreen, () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigation.mockReturnValue({
      replace: mockReplace
    });
    mockUseDispatch.mockReturnValue(mockDispatch);
  });

  it("should match the snapshot", () => {
    const component = render(<SendActivationErrorScreen />);

    expect(component).toMatchSnapshot();
  });
  it("should properly navigate to the send engagement screen", () => {
    const { getByTestId } = render(<SendActivationErrorScreen />);

    const retryButton = getByTestId("actionRetryID");
    fireEvent.press(retryButton);

    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith(
      MESSAGES_ROUTES.MESSAGES_NAVIGATOR,
      {
        screen: PN_ROUTES.MAIN,
        params: {
          screen: PN_ROUTES.SEND_ENGAGEMENT_ON_FIRST_APP_OPENING
        }
      }
    );
    expect(mockDispatch).not.toHaveBeenCalled();
  });
  it("should properly navigate to the message screen", () => {
    const { getByTestId } = render(<SendActivationErrorScreen />);

    const presentActivationBottomSheet = getByTestId("actionCloseID");
    fireEvent.press(presentActivationBottomSheet);

    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.MAIN, {
      screen: MESSAGES_ROUTES.MESSAGES_HOME
    });
    expect(mockDispatch).toHaveBeenCalled();
  });
});

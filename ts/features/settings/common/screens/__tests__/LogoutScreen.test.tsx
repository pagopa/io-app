import { render } from "@testing-library/react-native";
import { useDispatch } from "react-redux";
import LogoutScreen from "../LogoutScreen";
import { logoutRequest } from "../../../../authentication/common/store/actions";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn()
}));

jest.mock("../../../../authentication/common/store/actions", () => ({
  logoutRequest: jest.fn()
}));

describe("LogoutScreen", () => {
  it("should dispatch logoutRequest on mount", () => {
    const mockDispatch = jest.fn();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);

    render(<LogoutScreen />);

    expect(mockDispatch).toHaveBeenCalledWith(
      logoutRequest({ withApiCall: true })
    );
  });

  it("should render LoadingScreenContent with correct props", () => {
    const mockDispatch = jest.fn();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);

    const { getByTestId } = render(<LogoutScreen />);

    const loadingScreen = getByTestId("logout-test-id");
    expect(loadingScreen).toBeTruthy();
  });
});

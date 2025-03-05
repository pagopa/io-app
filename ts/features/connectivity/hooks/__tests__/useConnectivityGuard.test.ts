import { createStore } from "redux";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { useConnectivityGuard } from "../useConnectivityGuard";
import ROUTES from "../../../../navigation/routes";
import * as connectivitySelectors from "../../store/selectors";

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual<typeof import("@react-navigation/native")>(
    "@react-navigation/native"
  ),
  useNavigation: () => ({
    navigate: mockNavigate
  })
}));

/**
 * Helper function to render a component that uses the hook and executes a function
 */
const renderWithConnectivityGuard = (
  fn: (...args: Array<any>) => any,
  args: Array<any> = []
) => {
  const TestComponent = () => {
    const wrappedFunction = useConnectivityGuard(fn);
    // Call the wrapped function inside the component to ensure it's called with the hook's latest value
    void wrappedFunction(...args);
    return null;
  };

  return renderScreenWithNavigationStoreContext(
    TestComponent,
    "TEST",
    {},
    createStore(
      appReducer,
      appReducer(undefined, applicationChangeState("active")) as any
    )
  );
};

describe("useConnectivityGuard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should execute the function when connected", () => {
    // Mock the connectivity selector to return connected state
    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(true);

    const mockFn = jest.fn();
    renderWithConnectivityGuard(mockFn, ["test", 123]);

    // Function should be called with the same arguments
    expect(mockFn).toHaveBeenCalledWith("test", 123);
    // Navigation should not be called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should navigate to NO_CONNECTIVITY screen when not connected", () => {
    // Mock the connectivity selector to return disconnected state
    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(false);

    const mockFn = jest.fn();
    renderWithConnectivityGuard(mockFn, ["test", 123]);

    // Function should not be called
    expect(mockFn).not.toHaveBeenCalled();
    // Should navigate to NO_CONNECTIVITY screen
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.NO_CONNECTION);
  });

  it("should handle async functions when connected", async () => {
    // Mock the connectivity selector to return connected state
    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(true);

    const mockAsyncFn = jest.fn().mockResolvedValue("success");
    renderWithConnectivityGuard(mockAsyncFn, ["test"]);

    // Function should be called
    expect(mockAsyncFn).toHaveBeenCalledWith("test");
    // Navigation should not be called
    expect(mockNavigate).not.toHaveBeenCalled();

    // Wait for any pending promises to resolve
    await Promise.resolve();
  });

  it("should not execute async functions when not connected", () => {
    // Mock the connectivity selector to return disconnected state
    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(false);

    const mockAsyncFn = jest.fn().mockResolvedValue("success");
    renderWithConnectivityGuard(mockAsyncFn, ["test"]);

    // Function should not be called
    expect(mockAsyncFn).not.toHaveBeenCalled();
    // Should navigate to NO_CONNECTIVITY screen
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.NO_CONNECTION);
  });
});

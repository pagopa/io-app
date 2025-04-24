import { createStore } from "redux";
import { appReducer } from "../../store/reducers";
import { applicationChangeState } from "../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../utils/testWrapper";
import ROUTES from "../../navigation/routes";
import * as ingressSelectors from "../../features/ingress/store/selectors";
import I18n from "../../i18n";
import { OfflineAccessReasonEnum } from "../../features/ingress/store/reducer";
import { useOfflineToastGuard } from "../useOfflineToastGuard.ts";

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual<typeof import("@react-navigation/native")>(
    "@react-navigation/native"
  ),
  useNavigation: () => ({
    navigate: mockNavigate
  })
}));

const mockToast = jest.fn();

jest.mock("@pagopa/io-app-design-system", () => ({
  ...jest.requireActual<typeof import("@pagopa/io-app-design-system")>(
    "@pagopa/io-app-design-system"
  ),
  useIOToast: () => ({
    error: mockToast
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
    const wrappedFunction = useOfflineToastGuard(fn);
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
    jest
      .spyOn(ingressSelectors, "offlineAccessReasonSelector")
      .mockReturnValue(undefined);

    const mockFn = jest.fn();
    renderWithConnectivityGuard(mockFn, ["test", 123]);

    // Function should be called with the same arguments
    expect(mockFn).toHaveBeenCalledWith("test", 123);
    // Navigation should not be called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should handle async functions when connected", async () => {
    jest
      .spyOn(ingressSelectors, "offlineAccessReasonSelector")
      .mockReturnValue(undefined);

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
    jest
      .spyOn(ingressSelectors, "offlineAccessReasonSelector")
      .mockReturnValue(OfflineAccessReasonEnum.DEVICE_OFFLINE);

    const mockAsyncFn = jest.fn().mockResolvedValue("success");
    renderWithConnectivityGuard(mockAsyncFn, ["test"]);

    // Function should not be called
    expect(mockAsyncFn).not.toHaveBeenCalled();
    // Should navigate to NO_CONNECTIVITY screen
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.OFFLINE_FAILURE);
  });

  it("should show error toast when not connected", () => {
    jest
      .spyOn(ingressSelectors, "offlineAccessReasonSelector")
      .mockReturnValue(OfflineAccessReasonEnum.DEVICE_OFFLINE);

    const mockFn = jest.fn();
    renderWithConnectivityGuard(mockFn, ["test", 123]);

    // Function should not be called
    expect(mockFn).not.toHaveBeenCalled();
    // Should show error toast
    expect(mockToast).toHaveBeenCalledWith(I18n.t("global.offline.toast"));
  });
});

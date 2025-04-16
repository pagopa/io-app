import { fireEvent, render } from "@testing-library/react-native";

import { getNetworkError } from "../../../../../utils/errors";
import WalletPaymentWebView from "../WalletPaymentWebView";
import { WALLET_WEBVIEW_OUTCOME_SCHEMA } from "../../../common/utils/const";

// Mock for WebView component
jest.mock("react-native-webview", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View } = require("react-native");

  const WebView = (props: any) => <View {...props} />;

  return {
    WebView,
    default: WebView,
    __esModule: true
  };
});

// Mock hardware back button hook
const mockUseHardwareBackButton = jest.fn();
jest.mock("../../../../../hooks/useHardwareBackButton", () => ({
  useHardwareBackButton: (callback: () => boolean) => {
    mockUseHardwareBackButton.mockImplementation(() => callback());
    return mockUseHardwareBackButton;
  }
}));

jest.mock("../../../../../utils/environment", () => ({
  isDevEnv: false
}));

jest.mock("../../../../../utils/errors", () => ({
  getNetworkError: jest.fn()
}));

describe("WalletPaymentWebView", () => {
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the WebView with the correct URI", () => {
    const { getByTestId } = render(
      <WalletPaymentWebView
        uri="https://example.com"
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    const webView = getByTestId("webview");
    expect(webView.props.source.uri).toBe("https://example.com");
  });

  it("should call onSuccess when the URL matches the outcome schema", () => {
    const { getByTestId } = render(
      <WalletPaymentWebView
        uri="https://example.com"
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    const webView = getByTestId("webview");

    // Get the actual onShouldStartLoadWithRequest handler from props
    const onShouldStartLoadWithRequest =
      webView.props.onShouldStartLoadWithRequest;

    // Call the handler directly with the success URL
    const successUrl = `${WALLET_WEBVIEW_OUTCOME_SCHEMA}://success`;
    onShouldStartLoadWithRequest({ url: successUrl });

    expect(mockOnSuccess).toHaveBeenCalledWith(successUrl);
  });

  it("should call onError when the URL is about:blank", () => {
    const { getByTestId } = render(
      <WalletPaymentWebView
        uri="https://example.com"
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    const webView = getByTestId("webview");
    fireEvent(webView, "onShouldStartLoadWithRequest", {
      url: "about:blank"
    });

    expect(mockOnError).toHaveBeenCalledWith(
      getNetworkError("WalletPaymentWebViewScreen")
    );
  });

  it("should update canGoBack state on navigation state change", () => {
    const { getByTestId } = render(
      <WalletPaymentWebView
        uri="https://example.com"
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    const webView = getByTestId("webview");
    fireEvent(webView, "onNavigationStateChange", { canGoBack: true });

    // Since canGoBack is internal state, we cannot directly assert it.
    // Instead, we ensure no errors occur during this event.
    expect(mockOnError).not.toHaveBeenCalled();
  });

  it("should handle hardware back button when canGoBack is true", () => {
    const { getByTestId } = render(
      <WalletPaymentWebView
        uri="https://example.com"
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    const webView = getByTestId("webview");

    // First set canGoBack to true
    fireEvent(webView, "onNavigationStateChange", { canGoBack: true });

    // Now trigger the hardware back button
    mockUseHardwareBackButton();

    // The webView should have received a goBack call (cannot verify directly)
    expect(mockOnError).not.toHaveBeenCalled();
  });

  it("should call onError when hardware back button is pressed and cannot go back", () => {
    const error = { message: "Network error" };
    (getNetworkError as jest.Mock).mockReturnValueOnce(error);

    const { getByTestId } = render(
      <WalletPaymentWebView
        uri="https://example.com"
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    const webView = getByTestId("webview");
    // Ensure canGoBack is false (default state)
    fireEvent(webView, "onNavigationStateChange", { canGoBack: false });

    // Simulate hardware back button press
    mockUseHardwareBackButton();

    expect(mockOnError).toHaveBeenCalledWith(error);
  });
});

import { fireEvent, render } from "@testing-library/react-native";

import { WALLET_WEBVIEW_OUTCOME_SCHEMA } from "../../../common/utils/const";
import { WalletPaymentOutcomeEnum } from "../../types/PaymentOutcomeEnum";
import WalletPaymentWebView from "../WalletPaymentWebView";

// Mock for WebView component
jest.mock("react-native-webview", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View } = require("react-native");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require("react");

  const WebView = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(
      ref,
      () => ({
        goBack: jest.fn(),
        reload: jest.fn(),
        stopLoading: jest.fn()
      }),
      []
    );
    return <View {...props} />;
  });

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
  const mockOnCancel = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the WebView with the correct URI", () => {
    const { getByTestId } = render(
      <WalletPaymentWebView
        url="https://example.com"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        onError={mockOnError}
      />
    );

    const webView = getByTestId("webview");
    expect(webView.props.source.uri).toBe("https://example.com");
  });

  it("should call onSuccess when the URL matches the outcome schema", () => {
    const { getByTestId } = render(
      <WalletPaymentWebView
        url="https://example.com"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
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

  it("should call IN_APP_BROWSER_CLOSED_BY_USER when the URL is about:blank", () => {
    const { getByTestId } = render(
      <WalletPaymentWebView
        url="https://example.com"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        onError={mockOnError}
      />
    );

    const webView = getByTestId("webview");
    fireEvent(webView, "onShouldStartLoadWithRequest", {
      isTopFrame: true,
      url: "about:blank"
    });

    expect(mockOnCancel).toHaveBeenCalledWith(
      WalletPaymentOutcomeEnum.IN_APP_BROWSER_CLOSED_BY_USER
    );
  });

  it("should update canGoBack state on navigation state change", () => {
    const { getByTestId } = render(
      <WalletPaymentWebView
        url="https://example.com"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        onError={mockOnError}
      />
    );

    const webView = getByTestId("webview");
    fireEvent(webView, "onNavigationStateChange", { canGoBack: true });

    // Since canGoBack is internal state, we cannot directly assert it.
    // Instead, we ensure no errors occur durlng this event.
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it("should handle hardware back button when canGoBack is true", () => {
    const { getByTestId } = render(
      <WalletPaymentWebView
        url="https://example.com"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        onError={mockOnError}
      />
    );

    const webView = getByTestId("webview");

    // First set canGoBack to true
    fireEvent(webView, "onNavigationStateChange", { canGoBack: true });

    // Now trigger the hardware back button
    mockUseHardwareBackButton();

    // The webView should have received a goBack call (cannot verify directly)
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it("should call IN_APP_BROWSER_CLOSED_BY_USER when hardware back button is pressed and cannot go back", () => {
    const { getByTestId } = render(
      <WalletPaymentWebView
        url="https://example.com"
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onCancel={mockOnCancel}
      />
    );

    const webView = getByTestId("webview");
    // Ensure canGoBack is false (default state)
    fireEvent(webView, "onNavigationStateChange", { canGoBack: false });

    // Simulate hardware back button press
    mockUseHardwareBackButton();

    expect(mockOnCancel).toHaveBeenCalledWith(
      WalletPaymentOutcomeEnum.IN_APP_BROWSER_CLOSED_BY_USER
    );
  });
});

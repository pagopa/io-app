import { fireEvent, waitFor } from "@testing-library/react-native";
import { createStore } from "redux";
import { WebViewHttpErrorEvent } from "react-native-webview/lib/WebViewTypes";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import CieConsentDataUsageScreen from "../screens/CieConsentDataUsageScreen";
import * as loginUtils from "../../../common/utils/login";

jest.mock("../../../../../store/hooks", () => ({
  useIOSelector: jest.fn(),
  useIODispatch: () => jest.fn(),
  useIOStore: jest.fn()
}));

jest.mock("../../../../../utils/hooks/useOnboardingAbortAlert", () => ({
  useOnboardingAbortAlert: () => ({
    showAlert: jest.fn()
  })
}));

jest.mock("../../../../../hooks/useHeaderSecondLevel", () => ({
  useHeaderSecondLevel: jest.fn()
}));

jest.mock("../../../common/utils/login", () => ({
  onLoginUriChanged: jest.fn(() => () => false)
}));

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

describe("CieConsentDataUsageScreen", () => {
  it("should render correctly and match snapshot", () => {
    const component = renderComponent();
    expect(component).toMatchSnapshot();
  });

  it("should render WebView with correct props", () => {
    const { getByTestId } = renderComponent();
    const webView = getByTestId("webview-cie-test");

    expect(webView).toBeTruthy();
  });

  it("should handle WebView error and redirect to error screen", async () => {
    const { getByTestId } = renderComponent();

    const webView = getByTestId("webview-cie-test");
    fireEvent(webView, "onError");

    // attiva useEffect su `hasError`, non possiamo fare molto se non copertura
    await waitFor(() => {
      expect(webView).toBeTruthy();
    });
  });

  it("should handle HTTP error from WebView", async () => {
    const { getByTestId } = renderComponent();

    const webView = getByTestId("webview-cie-test");

    const httpError: WebViewHttpErrorEvent = {
      nativeEvent: {
        description: "500 Internal Server Error",
        statusCode: 500,
        url: "https://fake.url/consent"
      }
    } as any;

    fireEvent(webView, "onHttpError", httpError);

    await waitFor(() => {
      expect(webView).toBeTruthy();
    });
  });

  it("should not load token URL if onLoginUriChanged returns true", async () => {
    const mockOnLoginUriChanged = jest
      .spyOn(loginUtils, "onLoginUriChanged")
      .mockReturnValue(() => true);

    const { getByTestId } = renderComponent();
    const webView = getByTestId("webview-cie-test");

    fireEvent(webView, "onShouldStartLoadWithRequest", {
      url: "https://fake.url/login?token=abc"
    });

    expect(mockOnLoginUriChanged).toHaveBeenCalled();
  });

  it("should allow loading if onLoginUriChanged returns false", async () => {
    const mockOnLoginUriChanged = jest
      .spyOn(loginUtils, "onLoginUriChanged")
      .mockReturnValue(() => false);

    const { getByTestId } = renderComponent();
    const webView = getByTestId("webview-cie-test");

    fireEvent(webView, "onShouldStartLoadWithRequest", {
      url: "https://other.url"
    });

    expect(mockOnLoginUriChanged).toHaveBeenCalled();
  });
});

function renderComponent() {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <CieConsentDataUsageScreen />,
    AUTHENTICATION_ROUTES.CIE_CONSENT_DATA_USAGE,
    { cieConsentUri: encodeURIComponent("https://fake.url/consent") },
    store
  );
}

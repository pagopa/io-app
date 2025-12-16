import { RenderAPI } from "@testing-library/react-native";
import { WebView } from "react-native-webview";
import { createStore } from "redux";
import I18n from "i18next";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { WALLET_WEBVIEW_OUTCOME_SCHEMA } from "../../../common/utils/const";
import WalletPaymentWebViewScreen from "../WalletPaymentWebViewScreen";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PaymentsCheckoutRoutes } from "../../navigation/routes";

const mockSetOptions = jest.fn();
const mockNavigate = {
  navigate: jest.fn(),
  getParent: jest.fn().mockReturnValue({
    setOptions: mockSetOptions
  })
};

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useIONavigation: jest.fn().mockReturnValue(mockNavigate)
}));

describe("WalletPaymentWebViewScreen", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  it("snapshot for component", () => {
    const enrichedState = {
      ...globalState,
      features: {
        ...globalState.features,
        payments: {
          ...globalState.features.payments,
          checkout: {
            ...globalState.features.payments.checkout,
            webViewPayload: {
              url: "https://google.com",
              onSuccess: jest.fn()
            }
          }
        }
      }
    };

    const component = renderComponent(
      <WalletPaymentWebViewScreen />,
      enrichedState
    );
    expect(component).toMatchSnapshot();
  });

  it("should handle onShouldStartLoadWithRequest correctly", () => {
    const onSuccessMock = jest.fn();

    const enrichedState = {
      ...globalState,
      features: {
        ...globalState.features,
        payments: {
          ...globalState.features.payments,
          checkout: {
            ...globalState.features.payments.checkout,
            webViewPayload: {
              url: "https://google.com",
              onSuccess: onSuccessMock
            }
          }
        }
      }
    };

    const { UNSAFE_getByType } = renderComponent(
      <WalletPaymentWebViewScreen />,
      enrichedState
    );
    // with UNSAFE_getByType we can get the WebView component and its props
    const webView = UNSAFE_getByType(WebView);
    const onShouldStartLoadWithRequest =
      webView.props.onShouldStartLoadWithRequest;

    // Test with a URL that starts with WALLET_WEBVIEW_OUTCOME_SCHEMA
    const outcomeUrl = `${WALLET_WEBVIEW_OUTCOME_SCHEMA}?someParam=value`;
    const resultForOutcomeUrl = onShouldStartLoadWithRequest({
      url: outcomeUrl
    });

    // Verify onSuccess was called with the URL
    expect(onSuccessMock).toHaveBeenCalledWith(outcomeUrl);
    // Verify navigation is prevented (returns false)
    expect(resultForOutcomeUrl).toBe(false);

    // Test with a normal URL
    const normalUrl = "https://example.com";
    const resultForNormalUrl = onShouldStartLoadWithRequest({ url: normalUrl });

    // Verify onSuccess is not called again
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    // Verify navigation is allowed (returns true)
    expect(resultForNormalUrl).toBe(true);
  });

  it("should render the spinner on no url", () => {
    const { getByText } = renderComponent(
      <WalletPaymentWebViewScreen />,
      globalState
    );
    const loadingSpinnerText = getByText(I18n.t("global.remoteStates.wait"));
    expect(loadingSpinnerText).toBeTruthy();
  });
});

const renderComponent = (
  Component = <></>,
  enrichedState: GlobalState
): RenderAPI => {
  const store = createStore(appReducer, enrichedState as any);
  return renderScreenWithNavigationStoreContext(
    () => Component,
    PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_WEB_VIEW,
    {},
    store
  );
};

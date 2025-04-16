import { render } from "@testing-library/react-native";
import { WebView } from "react-native-webview";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import I18n from "../../../../../i18n";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { WALLET_WEBVIEW_OUTCOME_SCHEMA } from "../../../common/utils/const";
import WalletPaymentWebViewScreen from "../WalletPaymentWebViewScreen";

const mockSetOptions = jest.fn();
const mockNavigate = {
  navigate: jest.fn(),
  getParent: jest.fn().mockReturnValue({
    setOptions: mockSetOptions
  })
};

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => mockNavigate
}));

describe("WalletPaymentWebViewScreen", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();

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

    const enrichedStore: ReturnType<typeof mockStore> =
      mockStore(enrichedState);

    const component = render(
      <Provider store={enrichedStore}>
        <WalletPaymentWebViewScreen />
      </Provider>
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

    const enrichedStore: ReturnType<typeof mockStore> =
      mockStore(enrichedState);

    const { UNSAFE_getByType } = render(
      <Provider store={enrichedStore}>
        <WalletPaymentWebViewScreen />
      </Provider>
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
    const enrichedStore: ReturnType<typeof mockStore> = mockStore(globalState);
    const { getByText } = render(
      <Provider store={enrichedStore}>
        <WalletPaymentWebViewScreen />
      </Provider>
    );
    const loadingSpinnerText = getByText(I18n.t("global.remoteStates.wait"));
    expect(loadingSpinnerText).toBeTruthy();
  });
});

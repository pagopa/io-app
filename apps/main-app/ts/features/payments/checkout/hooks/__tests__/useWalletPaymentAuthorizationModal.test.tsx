/* eslint-disable functional/immutable-data */
import { AmountEuroCents } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/AmountEuroCents";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { openAuthSessionAsync, WebBrowserResultType } from "expo-web-browser";
import { Text } from "react-native";
import { getType } from "typesafe-actions";

import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { getNetworkError } from "../../../../../utils/errors";
import {
  storePaymentOutcomeToHistory,
  storePaymentsBrowserTypeAction
} from "../../../history/store/actions";
import { PaymentsCheckoutRoutes } from "../../navigation/routes";
import { paymentsStartPaymentAuthorizationAction } from "../../store/actions/networking";
import { paymentStartWebViewFlow } from "../../store/actions/orchestration";
import { walletPaymentAuthorizationUrlSelector } from "../../store/selectors/transaction";
import { WalletPaymentOutcomeEnum } from "../../types/PaymentOutcomeEnum";
import { useWalletPaymentAuthorizationModal } from "../useWalletPaymentAuthorizationModal";

jest.mock("../../../../../store/hooks", () => ({
  useIODispatch: jest.fn(),
  useIOSelector: jest.fn()
}));

jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: jest.fn()
}));

jest.mock("expo-web-browser", () => ({
  openAuthSessionAsync: jest.fn()
}));

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
const mockState: {
  authorizationUrlPot: unknown;
  isWebViewEnabled: boolean;
} = {
  authorizationUrlPot: pot.none,
  isWebViewEnabled: false
};

const mockPayload = {
  transactionId: "12345",
  paymentMethodId: "67890",
  pspId: "pspId",
  isAllCCP: true,
  paymentAmount: 100 as AmountEuroCents,
  paymentFees: 100 as AmountEuroCents
};

const renderHook = () => {
  const onAuthorizationOutcome = jest.fn();
  const TestComponent = () => {
    const {
      isError,
      isLoading,
      isPendingAuthorization,
      startPaymentAuthorizaton
    } = useWalletPaymentAuthorizationModal({ onAuthorizationOutcome });

    return (
      <Text
        onPress={() => startPaymentAuthorizaton(mockPayload)}
        testID="hook-result"
      >
        {JSON.stringify({ isError, isLoading, isPendingAuthorization })}
      </Text>
    );
  };

  return {
    ...render(<TestComponent />),
    onAuthorizationOutcome
  };
};

describe("useWalletPaymentAuthorizationModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState.authorizationUrlPot = pot.none;
    mockState.isWebViewEnabled = false;
    (useIODispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useIONavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });
    (useIOSelector as jest.Mock).mockImplementation(selector =>
      selector === walletPaymentAuthorizationUrlSelector
        ? mockState.authorizationUrlPot
        : mockState.isWebViewEnabled
    );
  });

  it("returns the initial authorization state", () => {
    const { getByText } = renderHook();

    expect(
      getByText(
        '{"isError":false,"isLoading":false,"isPendingAuthorization":false}'
      )
    ).toBeTruthy();
  });

  it("reflects loading and error states from the authorization URL", () => {
    mockState.authorizationUrlPot = pot.noneLoading;
    const loadingRender = renderHook();
    expect(
      loadingRender.getByText(
        '{"isError":false,"isLoading":true,"isPendingAuthorization":false}'
      )
    ).toBeTruthy();
    loadingRender.unmount();

    mockState.authorizationUrlPot = pot.noneError(
      getNetworkError("Generic Error")
    );
    const errorRender = renderHook();
    expect(
      errorRender.getByText(
        '{"isError":true,"isLoading":false,"isPendingAuthorization":false}'
      )
    ).toBeTruthy();
  });

  it("starts the payment authorization request", () => {
    const { getByTestId } = renderHook();

    fireEvent.press(getByTestId("hook-result"));

    expect(mockDispatch).toHaveBeenCalledWith(
      paymentsStartPaymentAuthorizationAction.request(mockPayload)
    );
  });

  it("opens the in-app browser and stores its successful payment outcome", async () => {
    const authorizationUrl = "https://psp.example/authorize";
    mockState.authorizationUrlPot = pot.some(authorizationUrl);
    jest.mocked(openAuthSessionAsync).mockResolvedValue({
      type: "success",
      url: "https://psp.example/return?outcome=0"
    });

    const { onAuthorizationOutcome } = renderHook();

    await waitFor(() => {
      expect(openAuthSessionAsync).toHaveBeenCalledWith(
        authorizationUrl,
        "iowallet://"
      );
    });
    await waitFor(() => {
      expect(onAuthorizationOutcome).toHaveBeenCalledWith(
        WalletPaymentOutcomeEnum.SUCCESS
      );
    });
    expect(mockDispatch).toHaveBeenCalledWith(
      storePaymentsBrowserTypeAction("inapp_browser")
    );
    expect(mockDispatch).toHaveBeenCalledWith(
      storePaymentOutcomeToHistory(WalletPaymentOutcomeEnum.SUCCESS)
    );
  });

  it("reports a generic error when the browser returns an invalid outcome", async () => {
    mockState.authorizationUrlPot = pot.some("https://psp.example/authorize");
    jest.mocked(openAuthSessionAsync).mockResolvedValue({
      type: "success",
      url: "https://psp.example/return?outcome=unknown"
    });

    const { onAuthorizationOutcome } = renderHook();

    await waitFor(() =>
      expect(onAuthorizationOutcome).toHaveBeenCalledWith(
        WalletPaymentOutcomeEnum.GENERIC_ERROR
      )
    );
  });

  it("reports a closed browser session when the user cancels", async () => {
    mockState.authorizationUrlPot = pot.some("https://psp.example/authorize");
    jest.mocked(openAuthSessionAsync).mockResolvedValue({
      type: "cancel" as WebBrowserResultType
    });

    const { onAuthorizationOutcome } = renderHook();

    await waitFor(() =>
      expect(onAuthorizationOutcome).toHaveBeenCalledWith(
        WalletPaymentOutcomeEnum.IN_APP_BROWSER_CLOSED_BY_USER
      )
    );
  });

  it("starts the WebView flow and handles its authorization result", async () => {
    const authorizationUrl = "https://psp.example/authorize";
    mockState.authorizationUrlPot = pot.some(authorizationUrl);
    mockState.isWebViewEnabled = true;

    const { onAuthorizationOutcome } = renderHook();

    expect(mockDispatch).toHaveBeenCalledWith(
      storePaymentsBrowserTypeAction("webview")
    );
    expect(mockNavigate).toHaveBeenCalledWith(
      PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR,
      {
        screen: PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_WEB_VIEW
      }
    );

    const webViewAction = mockDispatch.mock.calls
      .map(([action]) => action)
      .find(action => action.type === getType(paymentStartWebViewFlow));
    expect(webViewAction).toBeDefined();
    expect(webViewAction.payload.url).toBe(authorizationUrl);

    await act(async () => {
      webViewAction.payload.onSuccess("https://psp.example/return?outcome=0");
    });

    await waitFor(() =>
      expect(onAuthorizationOutcome).toHaveBeenCalledWith(
        WalletPaymentOutcomeEnum.SUCCESS
      )
    );
  });

  it("cancels any pending authorization request when unmounted", () => {
    const { unmount } = renderHook();

    unmount();

    expect(mockDispatch).toHaveBeenCalledWith(
      paymentsStartPaymentAuthorizationAction.cancel()
    );
  });
});

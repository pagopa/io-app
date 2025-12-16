import { View } from "react-native";
import { act, fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import configureMockStore from "redux-mock-store";
import * as analytics from "../../analytics";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";
import { WalletPaymentDetailScreen } from "../WalletPaymentDetailScreen";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PaymentsCheckoutRoutes } from "../../navigation/routes";
import { PaymentRequestsGetResponse } from "../../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { FaultCodeCategoryEnum } from "../../../../../../definitions/pagopa/ecommerce/GatewayFaultPaymentProblemJson";
import { paymentsGetPaymentDetailsAction } from "../../store/actions/networking";
import { Store } from "../../../../../store/actions/types";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";

jest.mock("../../analytics");
jest.mock("../../../../../utils/hooks/bottomSheet");

const mockNavigation = {
  navigate: jest.fn(),
  setOptions: jest.fn()
};

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => mockNavigation,
  useRoute: () => ({
    params: { rptId: "1234567890" as RptId }
  })
}));

const globalState = appReducer(undefined, applicationChangeState("active"));
const mockStore = configureMockStore<GlobalState>();
const mockModal = {
  present: jest.fn(),
  dismiss: jest.fn(),
  bottomSheet: <View testID="modal-view-test" />
};
const mockedUseIOBottomSheetModal = useIOBottomSheetModal as jest.Mock;
mockedUseIOBottomSheetModal.mockReturnValue(mockModal);

describe("WalletPaymentDetailScreen", () => {
  const renderComponent = () => {
    const state = mockStore(globalState);
    const store = createStore(appReducer, state as any);
    return {
      ...renderScreenWithNavigationStoreContext<GlobalState>(
        WalletPaymentDetailScreen,
        PaymentsCheckoutRoutes.PAYMENT_NOTICE_SUMMARY,
        {},
        store
      ),
      store
    };
  };

  it("renders loading indicator when payment details are loading", () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId("wallet-payment-detail-loading-indicator")).toBeTruthy();
  });

  it("renders payment failure detail component if there's an error in payment details", () => {
    const { getByTestId, store } = renderComponent();

    act(() => {
      store.dispatch(
        paymentsGetPaymentDetailsAction.failure({
          faultCodeCategory: FaultCodeCategoryEnum.GENERIC_ERROR,
          faultCodeDetail: "Some error"
        })
      );
    });

    expect(getByTestId("wallet-payment-failure-close-button")).toBeTruthy();
  });

  it("renders the main content if payment details are available", () => {
    const { getByTestId, store } = renderComponent();

    dispatchTestSuccess(store);

    expect(getByTestId("wallet-payment-detail-recipient")).toBeTruthy();
    expect(getByTestId("wallet-payment-detail-object")).toBeTruthy();
    expect(getByTestId("wallet-payment-detail-amount")).toBeTruthy();
  });

  it("tracks the start payment flow and store the new attempt 'Go to payment' button press", () => {
    const { getByTestId, store } = renderComponent();
    dispatchTestSuccess(store);
    const button = getByTestId("wallet-payment-detail-make-payment-button");
    fireEvent.press(button);
    expect(analytics.trackPaymentStartFlow).toHaveBeenCalled();
  });

  it("presents bottom sheet on info icon press for amount details", () => {
    const { getByTestId, store } = renderComponent();
    dispatchTestSuccess(store);
    const infoIcon = getByTestId("amount-info-icon");
    fireEvent.press(infoIcon);
    expect(analytics.trackPaymentSummaryAmountInfo).toHaveBeenCalled();
  });

  it("tracks analytics when payment summary screen is loaded", () => {
    const { store } = renderComponent();
    dispatchTestSuccess(store);
    expect(analytics.trackPaymentSummaryLoading).toHaveBeenCalled();
  });

  it("copies the payment notice number to clipboard on press", () => {
    const { getByTestId, store } = renderComponent();
    const noticeCode = "01234567890";
    const rptIdString = `${noticeCode}|012|0|13_digit_iuv_string|02`;
    act(() => {
      store.dispatch(
        paymentsGetPaymentDetailsAction.success({
          paFiscalCode: "12345678901",
          description: "Test",
          paName: "Test",
          amount: 5000,
          rptId: rptIdString as RptId,
          dueDate: "2022-12-31"
        } as PaymentRequestsGetResponse)
      );
    });
    const copyButton = getByTestId("payment-notice-copy-button");
    fireEvent.press(copyButton);
    expect(analytics.trackPaymentSummaryNoticeCopy).toHaveBeenCalled();
  });
});

const dispatchTestSuccess = (store: Store) =>
  act(() => {
    store.dispatch(
      paymentsGetPaymentDetailsAction.success({
        paFiscalCode: "12345678901",
        description: "Test",
        paName: "Test",
        amount: 5000,
        rptId: "1234567890",
        dueDate: "2022-12-31"
      } as PaymentRequestsGetResponse)
    );
  });

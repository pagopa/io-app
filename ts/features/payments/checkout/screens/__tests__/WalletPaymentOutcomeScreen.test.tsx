import { fireEvent, waitFor } from "@testing-library/react-native";
import { default as configureMockStore } from "redux-mock-store";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PaymentsCheckoutRoutes } from "../../navigation/routes";
import {
  REFETCH_LATEST_RECEIPTS_DELAY_MS,
  WalletPaymentOutcomeScreen
} from "../WalletPaymentOutcomeScreen";
import { WalletPaymentOutcomeEnum } from "../../types/PaymentOutcomeEnum";
import { getPaymentsLatestReceiptAction } from "../../../receipts/store/actions";
import * as useIO from "../../../../../store/hooks";

const renderComponent = (outcome: WalletPaymentOutcomeEnum) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState,
    walletPaymentOutcome: { outcome }
  } as GlobalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    WalletPaymentOutcomeScreen,
    PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_OUTCOME,
    { outcome },
    store
  );
};

describe("WalletPaymentOutcomeScreen for all outcomes", () => {
  Object.values(WalletPaymentOutcomeEnum).forEach(outcome => {
    it(`should render the WalletPaymentOutcomeScreen for outcome: ${outcome}`, () => {
      const renderedComponent = renderComponent(outcome);
      expect(renderedComponent.toJSON()).toMatchSnapshot();
    });
  });
  it(`should fetch the latest transaction after ${REFETCH_LATEST_RECEIPTS_DELAY_MS} milliseconds when closing the thank you page after a success outcome`, async () => {
    const mockedDispatch = jest.fn();
    jest.spyOn(useIO, "useIODispatch").mockImplementation(() => mockedDispatch);

    const { getByTestId } = renderComponent(WalletPaymentOutcomeEnum.SUCCESS);
    fireEvent.press(getByTestId("wallet-payment-outcome-success-button"));

    await waitFor(
      () => {
        expect(mockedDispatch).toHaveBeenCalledWith(
          getPaymentsLatestReceiptAction.request()
        );
      },
      { timeout: REFETCH_LATEST_RECEIPTS_DELAY_MS + 1000 }
    );
  });
});

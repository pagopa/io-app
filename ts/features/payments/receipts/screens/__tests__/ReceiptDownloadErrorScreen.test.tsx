import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PaymentsReceiptRoutes } from "../../navigation/routes";
import ReceiptDownloadErrorScreen from "../ReceiptDownloadErrorScreen";

const renderComponent = (state: GlobalState) => {
  const store = createStore(appReducer, state as any);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ReceiptDownloadErrorScreen,
    PaymentsReceiptRoutes.PAYMENT_RECEIPT_ERROR_SCREEN,
    {},
    store
  );
};

const globalState = appReducer(undefined, applicationChangeState("active"));
const errorState: GlobalState = {
  ...globalState,
  features: {
    ...globalState.features,
    payments: {
      ...globalState.features.payments,
      receipt: {
        ...globalState.features.payments.receipt,
        receiptDocument: pot.toError(pot.none, new Error("fail"))
      }
    }
  }
};

describe("ReceiptDownloadErrorScreen", () => {
  it("should render error state if receiptDocument is in error state", () => {
    const component = renderComponent(errorState);
    expect(
      component.getByTestId("download-receipt-error-screen")
    ).toBeDefined();
  });
});

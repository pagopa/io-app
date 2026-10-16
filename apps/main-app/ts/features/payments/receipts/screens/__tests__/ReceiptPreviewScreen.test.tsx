import * as pot from "@pagopa/ts-commons/lib/pot";
import { fireEvent, waitFor } from "@testing-library/react-native";
import I18n from "i18next";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PaymentsReceiptRoutes } from "../../navigation/routes";
import ReceiptPreviewScreen from "../ReceiptPreviewScreen";

jest.mock("expo-sharing", () => ({
  shareAsync: jest.fn(() => Promise.resolve())
}));

const renderComponent = (state: GlobalState) => {
  const store = createStore(appReducer, state as any);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ReceiptPreviewScreen,
    PaymentsReceiptRoutes.PAYMENT_RECEIPT_PREVIEW_SCREEN,
    {},
    store
  );
};

const globalState = appReducer(undefined, applicationChangeState("active"));

describe("ReceiptPreviewScreen", () => {
  it("should display an OperationResultScreenContent when receipt is not available", () => {
    const emptyState: GlobalState = {
      ...globalState,
      features: {
        ...globalState.features,
        payments: {
          ...globalState.features.payments,
          receipt: {
            ...globalState.features.payments.receipt,
            receiptDocument: pot.noneLoading
          }
        }
      }
    };

    const { getByText } = renderComponent(emptyState);
    expect(getByText(I18n.t("global.genericError"))).toBeDefined();
  });

  it("should display receipt preview when receipt is available", async () => {
    const loadedState: GlobalState = {
      ...globalState,
      features: {
        ...globalState.features,
        payments: {
          ...globalState.features.payments,
          receipt: {
            ...globalState.features.payments.receipt,
            receiptDocument: pot.some({
              base64File: "base64string",
              filename: "test_receipt.pdf"
            })
          }
        }
      }
    };

    const { getByText } = renderComponent(loadedState);
    const button = getByText(
      I18n.t("features.payments.transactions.receipt.shareButton")
    );
    expect(button).toBeDefined();

    fireEvent.press(button);

    await waitFor(() => {
      expect(require("expo-sharing").shareAsync).toHaveBeenCalled();
    });
  });
});

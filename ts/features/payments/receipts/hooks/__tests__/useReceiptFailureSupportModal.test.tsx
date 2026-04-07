import * as pot from "@pagopa/ts-commons/lib/pot";
import { fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";
import { JSX } from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";
import { NetworkError } from "../../../../../utils/errors";
import {
  DownloadReceiptOutcomeErrorEnum,
  ReceiptDownloadFailure
} from "../../types";
import useReceiptFailureSupportModal from "../useReceiptFailureSupportModal";

jest.mock("../../../../../utils/hooks/bottomSheet", () => ({
  // To immediately render the component, mock the bottom sheet
  useIOBottomSheetModal: (params: { component: JSX.Element }) => ({
    bottomSheet: params.component,
    present: jest.fn(),
    dismiss: jest.fn()
  })
}));

jest.mock("../../../../../utils/clipboard", () => ({
  clipboardSetStringWithFeedback: jest.fn()
}));

type Params = {
  error: NetworkError | ReceiptDownloadFailure | undefined;
};

const initialState = appReducer(undefined, applicationChangeState("active"));

const renderHook = (params: Params, state: GlobalState = initialState) => {
  const mockStore = configureMockStore<GlobalState>();

  const Component = () => {
    const { bottomSheet } = useReceiptFailureSupportModal(params.error);
    return bottomSheet;
  };

  return render(
    <Provider store={mockStore(state)}>
      <Component />
    </Provider>
  );
};

const mockError = {
  title: "Not Found",
  status: 404,
  detail: "Attachment not found",
  code: DownloadReceiptOutcomeErrorEnum.AT_404_001
} as ReceiptDownloadFailure;

describe("useReceiptFailureSupportModal", () => {
  it("renders bottom sheet without error details", () => {
    const { queryByTestId } = renderHook({ error: new Error("Test") });
    expect(queryByTestId("receipt-failure-support-modal-header")).toBeTruthy();
    expect(
      queryByTestId("receipt-failure-support-modal-fault-code")
    ).toBeNull();
    expect(
      queryByTestId("receipt-failure-support-modal-transaction-id")
    ).toBeNull();
  });

  it("renders bottom sheet with error details", () => {
    const errorState: GlobalState = {
      ...initialState,
      features: {
        ...initialState.features,
        payments: {
          ...initialState.features.payments,

          history: {
            ...initialState.features.payments.history,
            analyticsData: {
              receiptEventId: "receipt-event-id-123"
            }
          },
          receipt: {
            ...initialState.features.payments.receipt,
            receiptDocument: pot.toError(pot.none, mockError)
          }
        }
      }
    };
    const { queryByTestId } = renderHook(
      {
        error: mockError
      },
      errorState
    );
    expect(queryByTestId("receipt-failure-support-modal-header")).toBeTruthy();
    expect(
      queryByTestId("receipt-failure-support-modal-fault-code")
    ).toBeTruthy();
    expect(
      queryByTestId("receipt-failure-support-modal-transaction-id")
    ).toBeTruthy();
  });

  it("copies data to clipboard on press", () => {
    const mockClipboard = clipboardSetStringWithFeedback as jest.Mock;

    const errorState: GlobalState = {
      ...initialState,
      features: {
        ...initialState.features,
        payments: {
          ...initialState.features.payments,
          history: {
            ...initialState.features.payments.history,
            analyticsData: {
              receiptEventId: "receipt-event-id-123"
            }
          },
          receipt: {
            ...initialState.features.payments.receipt,
            receiptDocument: pot.toError(pot.none, mockError)
          }
        }
      }
    };
    const { getByTestId } = renderHook(
      {
        error: mockError
      },
      errorState
    );

    const faultCodeElement = getByTestId(
      "receipt-failure-support-modal-fault-code"
    );
    const transactionIdElement = getByTestId(
      "receipt-failure-support-modal-transaction-id"
    );

    const copyAllButton = getByTestId(
      "receipt-failure-support-modal-copy-all-button"
    );

    fireEvent.press(faultCodeElement);
    expect(mockClipboard).toHaveBeenCalledWith(mockError.code);

    fireEvent.press(transactionIdElement);
    expect(mockClipboard).toHaveBeenCalledWith("receipt-event-id-123");

    fireEvent.press(copyAllButton);
    expect(mockClipboard).toHaveBeenCalledWith(
      `${I18n.t("wallet.payment.support.errorCode")}: ${mockError.code}
    ${I18n.t("transaction.details.info.transactionId")}: receipt-event-id-123`
    );
  });
});

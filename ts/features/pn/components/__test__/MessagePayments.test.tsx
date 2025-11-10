import { createStore } from "redux";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import PN_ROUTES from "../../navigation/routes";
import { MessagePayments } from "../MessagePayments";
import { NotificationPaymentInfo } from "../../../../../definitions/pn/NotificationPaymentInfo";
import { GlobalState } from "../../../../store/reducers/types";
import { remoteError, remoteReady } from "../../../../common/model/RemoteValue";
import { PaymentInfoResponse } from "../../../../../definitions/backend/PaymentInfoResponse";
import { Detail_v2Enum } from "../../../../../definitions/backend/PaymentProblemJson";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { toSpecificError } from "../../../messages/types/paymentErrors";

const globalMessageId = "01HTFFDYS8VQ779EA4M5WB9YWA";
const globalMaxVisiblePaymentCount = 5;
const globalDueDate = new Date(2099, 4, 2, 1, 1, 1);
const generatePayablePayment = (rptId: string, amount: number) =>
  ({
    rptId,
    amount,
    dueDate: globalDueDate,
    description: "hendrerit orci id dolor consectetur"
  } as PaymentInfoResponse);
const notificationPaymentInfosFromPaymentIds = (paymentIds: Array<string>) =>
  paymentIds.map(
    payment =>
      ({
        creditorTaxId: payment.substring(0, 11),
        noticeCode: payment.substring(11)
      } as NotificationPaymentInfo)
  );

describe("MessagePayments", () => {
  it("should match snapshot when cancelled, without payments, without cancelled-completed-payments", () => {
    const initialState = globalState();
    const component = renderComponent(
      globalMessageId,
      true,
      [],
      [],
      initialState
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when cancelled with payments without completed payments", () => {
    const initialState = globalState();
    const paymentIds = [
      "01234567890012345678912345610",
      "01234567890012345678912345620",
      "01234567890012345678912345630",
      "01234567890012345678912345640",
      "01234567890012345678912345650",
      "01234567890012345678912345660",
      "01234567890012345678912345670"
    ];
    const paymentsState: GlobalState = {
      ...initialState,
      entities: {
        ...initialState.entities,
        messages: {
          ...initialState.entities.messages,
          payments: {
            ...initialState.entities.messages.payments,
            paymentStatusListById: {
              ...initialState.entities.messages.payments.paymentStatusListById,
              [globalMessageId]: {
                [paymentIds[0]]: remoteReady(
                  generatePayablePayment(paymentIds[0], 199)
                ),
                [paymentIds[1]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO)
                ),
                [paymentIds[2]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_SCADUTO)
                ),
                [paymentIds[3]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_IN_CORSO)
                ),
                [paymentIds[4]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO)
                ),
                [paymentIds[5]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_SCONOSCIUTO)
                ),
                [paymentIds[6]]: remoteError(
                  toSpecificError(Detail_v2Enum.GENERIC_ERROR)
                )
              }
            }
          }
        }
      }
    };
    const payments = notificationPaymentInfosFromPaymentIds(paymentIds);
    const component = renderComponent(
      globalMessageId,
      true,
      payments,
      [],
      paymentsState
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when cancelled, without payments, with cancelled-completed-payments", () => {
    const initialState = globalState();
    const paymentIds = [
      "01234567890012345678912345610",
      "01234567890012345678912345620",
      "01234567890012345678912345630",
      "01234567890012345678912345640",
      "01234567890012345678912345650",
      "01234567890012345678912345660",
      "01234567890012345678912345670"
    ];
    const component = renderComponent(
      globalMessageId,
      true,
      [],
      paymentIds,
      initialState
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when cancelled, with payments, with cancelled-completed-payments", () => {
    const messageId = "01HTFFDYS8VQ779EA4M5WB9YWA";
    const initialState = globalState();
    const paymentIds = [
      "01234567890012345678912345610",
      "01234567890012345678912345620",
      "01234567890012345678912345630",
      "01234567890012345678912345640",
      "01234567890012345678912345650",
      "01234567890012345678912345660",
      "01234567890012345678912345670"
    ];
    const paymentsState: GlobalState = {
      ...initialState,
      entities: {
        ...initialState.entities,
        messages: {
          ...initialState.entities.messages,
          payments: {
            ...initialState.entities.messages.payments,
            paymentStatusListById: {
              ...initialState.entities.messages.payments.paymentStatusListById,
              [messageId]: {
                [paymentIds[0]]: remoteReady(
                  generatePayablePayment(paymentIds[0], 199)
                ),
                [paymentIds[1]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO)
                ),
                [paymentIds[2]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_SCADUTO)
                ),
                [paymentIds[3]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_IN_CORSO)
                ),
                [paymentIds[4]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO)
                ),
                [paymentIds[5]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_SCONOSCIUTO)
                ),
                [paymentIds[6]]: remoteError(
                  toSpecificError(Detail_v2Enum.GENERIC_ERROR)
                )
              }
            }
          }
        }
      }
    };
    const payments = notificationPaymentInfosFromPaymentIds(paymentIds);
    const component = renderComponent(
      globalMessageId,
      true,
      payments,
      paymentIds,
      paymentsState
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when not cancelled, without payments, without cancelled-completed-payments", () => {
    const initialState = globalState();
    const component = renderComponent(
      globalMessageId,
      false,
      [],
      [],
      initialState
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when not cancelled, without payments, with cancelled-completed-payments", () => {
    const initialState = globalState();
    const paymentIds = [
      "01234567890012345678912345610",
      "01234567890012345678912345620",
      "01234567890012345678912345630",
      "01234567890012345678912345640",
      "01234567890012345678912345650",
      "01234567890012345678912345660",
      "01234567890012345678912345670"
    ];
    const component = renderComponent(
      globalMessageId,
      false,
      [],
      paymentIds,
      initialState
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when not cancelled, with one payable payment, with cancelled-completed-payments", () => {
    const initialState = globalState();
    const paymentIds = ["01234567890012345678912345610"];
    const paymentsState: GlobalState = {
      ...initialState,
      entities: {
        ...initialState.entities,
        messages: {
          ...initialState.entities.messages,
          payments: {
            ...initialState.entities.messages.payments,
            paymentStatusListById: {
              ...initialState.entities.messages.payments.paymentStatusListById,
              [globalMessageId]: {
                [paymentIds[0]]: remoteReady(
                  generatePayablePayment(paymentIds[0], 199)
                )
              }
            }
          }
        }
      }
    };
    const payments = notificationPaymentInfosFromPaymentIds(paymentIds);
    const component = renderComponent(
      globalMessageId,
      false,
      payments,
      paymentIds,
      paymentsState
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when not cancelled, with one payable payment, without cancelled-completed-payments", () => {
    const initialState = globalState();
    const paymentIds = ["01234567890012345678912345610"];
    const paymentsState: GlobalState = {
      ...initialState,
      entities: {
        ...initialState.entities,
        messages: {
          ...initialState.entities.messages,
          payments: {
            ...initialState.entities.messages.payments,
            paymentStatusListById: {
              ...initialState.entities.messages.payments.paymentStatusListById,
              [globalMessageId]: {
                [paymentIds[0]]: remoteReady(
                  generatePayablePayment(paymentIds[0], 199)
                )
              }
            }
          }
        }
      }
    };
    const payments = notificationPaymentInfosFromPaymentIds(paymentIds);
    const component = renderComponent(
      globalMessageId,
      false,
      payments,
      [],
      paymentsState
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when not cancelled, with five (max-visible-payments) payable payments, with cancelled-completed-payments", () => {
    const initialState = globalState();
    const paymentIds = [
      "01234567890012345678912345610",
      "01234567890012345678912345620",
      "01234567890012345678912345630",
      "01234567890012345678912345640",
      "01234567890012345678912345650"
    ];
    const paymentsState: GlobalState = {
      ...initialState,
      entities: {
        ...initialState.entities,
        messages: {
          ...initialState.entities.messages,
          payments: {
            ...initialState.entities.messages.payments,
            paymentStatusListById: {
              ...initialState.entities.messages.payments.paymentStatusListById,
              [globalMessageId]: {
                [paymentIds[0]]: remoteReady(
                  generatePayablePayment(paymentIds[0], 199)
                ),
                [paymentIds[1]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO)
                ),
                [paymentIds[2]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_SCADUTO)
                ),
                [paymentIds[3]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_IN_CORSO)
                ),
                [paymentIds[4]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO)
                )
              }
            }
          }
        }
      }
    };
    const payments = notificationPaymentInfosFromPaymentIds(paymentIds);
    const component = renderComponent(
      globalMessageId,
      false,
      payments,
      paymentIds,
      paymentsState
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when not cancelled, with five (max-visible-payments) payable payments, without cancelled-completed-payments", () => {
    const initialState = globalState();
    const paymentIds = [
      "01234567890012345678912345610",
      "01234567890012345678912345620",
      "01234567890012345678912345630",
      "01234567890012345678912345640",
      "01234567890012345678912345650"
    ];
    const paymentsState: GlobalState = {
      ...initialState,
      entities: {
        ...initialState.entities,
        messages: {
          ...initialState.entities.messages,
          payments: {
            ...initialState.entities.messages.payments,
            paymentStatusListById: {
              ...initialState.entities.messages.payments.paymentStatusListById,
              [globalMessageId]: {
                [paymentIds[0]]: remoteReady(
                  generatePayablePayment(paymentIds[0], 199)
                ),
                [paymentIds[1]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO)
                ),
                [paymentIds[2]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_SCADUTO)
                ),
                [paymentIds[3]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_IN_CORSO)
                ),
                [paymentIds[4]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO)
                )
              }
            }
          }
        }
      }
    };
    const payments = notificationPaymentInfosFromPaymentIds(paymentIds);
    const component = renderComponent(
      globalMessageId,
      false,
      payments,
      [],
      paymentsState
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when not cancelled, with more-than-five (max-visible-payments) payable payments, with cancelled-completed-payments", () => {
    const initialState = globalState();
    const paymentIds = [
      "01234567890012345678912345610",
      "01234567890012345678912345620",
      "01234567890012345678912345630",
      "01234567890012345678912345640",
      "01234567890012345678912345650",
      "01234567890012345678912345660",
      "01234567890012345678912345670"
    ];
    const paymentsState: GlobalState = {
      ...initialState,
      entities: {
        ...initialState.entities,
        messages: {
          ...initialState.entities.messages,
          payments: {
            ...initialState.entities.messages.payments,
            paymentStatusListById: {
              ...initialState.entities.messages.payments.paymentStatusListById,
              [globalMessageId]: {
                [paymentIds[0]]: remoteReady(
                  generatePayablePayment(paymentIds[0], 199)
                ),
                [paymentIds[1]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO)
                ),
                [paymentIds[2]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_SCADUTO)
                ),
                [paymentIds[3]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_IN_CORSO)
                ),
                [paymentIds[4]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO)
                ),
                [paymentIds[5]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_SCONOSCIUTO)
                ),
                [paymentIds[6]]: remoteError(
                  toSpecificError(Detail_v2Enum.GENERIC_ERROR)
                )
              }
            }
          }
        }
      }
    };
    const payments = notificationPaymentInfosFromPaymentIds(paymentIds);
    const component = renderComponent(
      globalMessageId,
      false,
      payments,
      paymentIds,
      paymentsState
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when not cancelled, with more-than-five (max-visible-payments) payable payments, without cancelled-completed-payments", () => {
    const initialState = globalState();
    const paymentIds = [
      "01234567890012345678912345610",
      "01234567890012345678912345620",
      "01234567890012345678912345630",
      "01234567890012345678912345640",
      "01234567890012345678912345650",
      "01234567890012345678912345660",
      "01234567890012345678912345670"
    ];
    const paymentsState: GlobalState = {
      ...initialState,
      entities: {
        ...initialState.entities,
        messages: {
          ...initialState.entities.messages,
          payments: {
            ...initialState.entities.messages.payments,
            paymentStatusListById: {
              ...initialState.entities.messages.payments.paymentStatusListById,
              [globalMessageId]: {
                [paymentIds[0]]: remoteReady(
                  generatePayablePayment(paymentIds[0], 199)
                ),
                [paymentIds[1]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO)
                ),
                [paymentIds[2]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_SCADUTO)
                ),
                [paymentIds[3]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_IN_CORSO)
                ),
                [paymentIds[4]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO)
                ),
                [paymentIds[5]]: remoteError(
                  toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_SCONOSCIUTO)
                ),
                [paymentIds[6]]: remoteError(
                  toSpecificError(Detail_v2Enum.GENERIC_ERROR)
                )
              }
            }
          }
        }
      }
    };
    const payments = notificationPaymentInfosFromPaymentIds(paymentIds);
    const component = renderComponent(
      globalMessageId,
      false,
      payments,
      [],
      paymentsState
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const globalState = (): GlobalState =>
  appReducer(undefined, applicationChangeState("active"));

const renderComponent = (
  messageId: string,
  isCancelled: boolean,
  payments: Array<NotificationPaymentInfo>,
  completedPayments: Array<string>,
  initialState: GlobalState,
  maxVisiblePaymentCount: number = globalMaxVisiblePaymentCount
) => {
  const store = createStore(appReducer, initialState as any);
  const mockPresentPaymentsBottomSheetRef = {
    current: () => undefined
  };

  return renderScreenWithNavigationStoreContext(
    () => (
      <MessagePayments
        completedPaymentNoticeCodes={completedPayments}
        isCancelled={isCancelled}
        maxVisiblePaymentCount={maxVisiblePaymentCount}
        messageId={messageId}
        payments={payments}
        presentPaymentsBottomSheetRef={mockPresentPaymentsBottomSheetRef}
        serviceId={"01J5X3DFDZJ9AJ6CW89WY8QS4N" as ServiceId}
        sendOpeningSource={"message"}
        sendUserType={"recipient"}
      />
    ),
    PN_ROUTES.MESSAGE_DETAILS,
    {},
    store
  );
};

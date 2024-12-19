import { createStore } from "redux";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../store/actions/persistedPreferences";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import PN_ROUTES from "../../navigation/routes";
import { MessagePayments } from "../MessagePayments";
import { UIMessageId } from "../../../messages/types";
import { NotificationPaymentInfo } from "../../../../../definitions/pn/NotificationPaymentInfo";
import { GlobalState } from "../../../../store/reducers/types";
import { remoteError, remoteReady } from "../../../../common/model/RemoteValue";
import { PaymentRequestsGetResponse } from "../../../../../definitions/backend/PaymentRequestsGetResponse";
import { Detail_v2Enum } from "../../../../../definitions/backend/PaymentProblemJson";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";

const globalMessageId = "01HTFFDYS8VQ779EA4M5WB9YWA" as UIMessageId;
const globalMaxVisiblePaymentCount = 5;
const globalDueDate = new Date(2099, 4, 2, 1, 1, 1);
const generatePayablePayment = (
  codiceContestoPagamento: string,
  amount: number
) =>
  ({
    codiceContestoPagamento,
    importoSingoloVersamento: amount,
    dueDate: globalDueDate,
    causaleVersamento: "hendrerit orci id dolor consectetur"
  } as PaymentRequestsGetResponse);
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
    const initialState = dsEnabledGlobalState();
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
    const initialState = dsEnabledGlobalState();
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
            [globalMessageId]: {
              [paymentIds[0]]: remoteReady(
                generatePayablePayment(paymentIds[0], 199)
              ),
              [paymentIds[1]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO
              ),
              [paymentIds[2]]: remoteError(Detail_v2Enum.PAA_PAGAMENTO_SCADUTO),
              [paymentIds[3]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_IN_CORSO
              ),
              [paymentIds[4]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO
              ),
              [paymentIds[5]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_SCONOSCIUTO
              ),
              [paymentIds[6]]: remoteError(Detail_v2Enum.GENERIC_ERROR)
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
    const initialState = dsEnabledGlobalState();
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
    const messageId = "01HTFFDYS8VQ779EA4M5WB9YWA" as UIMessageId;
    const initialState = dsEnabledGlobalState();
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
            [messageId]: {
              [paymentIds[0]]: remoteReady(
                generatePayablePayment(paymentIds[0], 199)
              ),
              [paymentIds[1]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO
              ),
              [paymentIds[2]]: remoteError(Detail_v2Enum.PAA_PAGAMENTO_SCADUTO),
              [paymentIds[3]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_IN_CORSO
              ),
              [paymentIds[4]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO
              ),
              [paymentIds[5]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_SCONOSCIUTO
              ),
              [paymentIds[6]]: remoteError(Detail_v2Enum.GENERIC_ERROR)
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
    const initialState = dsEnabledGlobalState();
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
    const initialState = dsEnabledGlobalState();
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
    const initialState = dsEnabledGlobalState();
    const paymentIds = ["01234567890012345678912345610"];
    const paymentsState: GlobalState = {
      ...initialState,
      entities: {
        ...initialState.entities,
        messages: {
          ...initialState.entities.messages,
          payments: {
            ...initialState.entities.messages.payments,
            [globalMessageId]: {
              [paymentIds[0]]: remoteReady(
                generatePayablePayment(paymentIds[0], 199)
              )
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
    const initialState = dsEnabledGlobalState();
    const paymentIds = ["01234567890012345678912345610"];
    const paymentsState: GlobalState = {
      ...initialState,
      entities: {
        ...initialState.entities,
        messages: {
          ...initialState.entities.messages,
          payments: {
            ...initialState.entities.messages.payments,
            [globalMessageId]: {
              [paymentIds[0]]: remoteReady(
                generatePayablePayment(paymentIds[0], 199)
              )
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
    const initialState = dsEnabledGlobalState();
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
            [globalMessageId]: {
              [paymentIds[0]]: remoteReady(
                generatePayablePayment(paymentIds[0], 199)
              ),
              [paymentIds[1]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO
              ),
              [paymentIds[2]]: remoteError(Detail_v2Enum.PAA_PAGAMENTO_SCADUTO),
              [paymentIds[3]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_IN_CORSO
              ),
              [paymentIds[4]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO
              )
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
    const initialState = dsEnabledGlobalState();
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
            [globalMessageId]: {
              [paymentIds[0]]: remoteReady(
                generatePayablePayment(paymentIds[0], 199)
              ),
              [paymentIds[1]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO
              ),
              [paymentIds[2]]: remoteError(Detail_v2Enum.PAA_PAGAMENTO_SCADUTO),
              [paymentIds[3]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_IN_CORSO
              ),
              [paymentIds[4]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO
              )
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
    const initialState = dsEnabledGlobalState();
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
            [globalMessageId]: {
              [paymentIds[0]]: remoteReady(
                generatePayablePayment(paymentIds[0], 199)
              ),
              [paymentIds[1]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO
              ),
              [paymentIds[2]]: remoteError(Detail_v2Enum.PAA_PAGAMENTO_SCADUTO),
              [paymentIds[3]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_IN_CORSO
              ),
              [paymentIds[4]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO
              ),
              [paymentIds[5]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_SCONOSCIUTO
              ),
              [paymentIds[6]]: remoteError(Detail_v2Enum.GENERIC_ERROR)
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
    const initialState = dsEnabledGlobalState();
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
            [globalMessageId]: {
              [paymentIds[0]]: remoteReady(
                generatePayablePayment(paymentIds[0], 199)
              ),
              [paymentIds[1]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO
              ),
              [paymentIds[2]]: remoteError(Detail_v2Enum.PAA_PAGAMENTO_SCADUTO),
              [paymentIds[3]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_IN_CORSO
              ),
              [paymentIds[4]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO
              ),
              [paymentIds[5]]: remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_SCONOSCIUTO
              ),
              [paymentIds[6]]: remoteError(Detail_v2Enum.GENERIC_ERROR)
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

const dsEnabledGlobalState = (): GlobalState => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  return appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
};

const renderComponent = (
  messageId: UIMessageId,
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
      />
    ),
    PN_ROUTES.MESSAGE_DETAILS,
    {},
    store
  );
};

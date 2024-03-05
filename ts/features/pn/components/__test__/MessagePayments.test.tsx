import React from "react";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { UIMessageId } from "../../../messages/types";
import { NotificationPaymentInfo } from "../../../../../definitions/pn/NotificationPaymentInfo";
import { PaymentRequestsGetResponse } from "../../../../../definitions/backend/PaymentRequestsGetResponse";
import { Detail_v2Enum } from "../../../../../definitions/backend/PaymentProblemJson";
import { MessagePayments } from "../MessagePayments";
import { updatePaymentForMessage } from "../../../messages/store/actions";

describe("MessagePayments component", () => {
  it("Should match the snapshot for a single loading payment", () => {
    const messageId = "m1" as UIMessageId;
    const payments = [
      {
        creditorTaxId: "c1",
        noticeCode: "n1"
      }
    ] as Array<NotificationPaymentInfo>;
    const component = renderComponent(
      messageId,
      false,
      payments,
      undefined,
      undefined
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match the snapshot for five loading payments", () => {
    const messageId = "m1" as UIMessageId;
    const payments = [
      {
        creditorTaxId: "c1",
        noticeCode: "n1"
      },
      {
        creditorTaxId: "c1",
        noticeCode: "n2"
      },
      {
        creditorTaxId: "c1",
        noticeCode: "n3"
      },
      {
        creditorTaxId: "c1",
        noticeCode: "n4"
      },
      {
        creditorTaxId: "c1",
        noticeCode: "n5"
      }
    ] as Array<NotificationPaymentInfo>;
    const component = renderComponent(
      messageId,
      false,
      payments,
      undefined,
      undefined
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match the snapshot for more than five loading payments", () => {
    const messageId = "m1" as UIMessageId;
    const payments = [
      {
        creditorTaxId: "c1",
        noticeCode: "n1"
      },
      {
        creditorTaxId: "c1",
        noticeCode: "n2"
      },
      {
        creditorTaxId: "c1",
        noticeCode: "n3"
      },
      {
        creditorTaxId: "c1",
        noticeCode: "n4"
      },
      {
        creditorTaxId: "c1",
        noticeCode: "n5"
      },
      {
        creditorTaxId: "c1",
        noticeCode: "n6"
      }
    ] as Array<NotificationPaymentInfo>;
    const component = renderComponent(
      messageId,
      false,
      payments,
      undefined,
      undefined
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match the snapshot for five payable payments", () => {
    const messageId = "m1" as UIMessageId;
    const payments = [
      {
        creditorTaxId: "c1",
        noticeCode: "n1"
      },
      {
        creditorTaxId: "c1",
        noticeCode: "n2"
      },
      {
        creditorTaxId: "c1",
        noticeCode: "n3"
      },
      {
        creditorTaxId: "c1",
        noticeCode: "n4"
      },
      {
        creditorTaxId: "c1",
        noticeCode: "n5"
      }
    ] as Array<NotificationPaymentInfo>;
    const component = renderComponent(
      messageId,
      false,
      payments,
      "payable",
      undefined
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match the snapshot for five processed payments", () => {
    const messageId = "m1" as UIMessageId;
    const payments = [
      {
        creditorTaxId: "c1",
        noticeCode: "n1"
      },
      {
        creditorTaxId: "c1",
        noticeCode: "n2"
      },
      {
        creditorTaxId: "c1",
        noticeCode: "n3"
      },
      {
        creditorTaxId: "c1",
        noticeCode: "n4"
      },
      {
        creditorTaxId: "c1",
        noticeCode: "n5"
      }
    ] as Array<NotificationPaymentInfo>;
    const component = renderComponent(
      messageId,
      false,
      payments,
      "processed",
      undefined
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match the snapshot for a cancelled message with no completed payments", () => {
    const messageId = "m1" as UIMessageId;
    const component = renderComponent(
      messageId,
      true,
      undefined,
      undefined,
      undefined
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match the snapshot for a cancelled message with three completed payments", () => {
    const messageId = "m1" as UIMessageId;
    const component = renderComponent(messageId, true, undefined, undefined, [
      "n1",
      "n2",
      "n3"
    ]);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = (
  messageId: UIMessageId,
  isCancelled: boolean,
  payments: ReadonlyArray<NotificationPaymentInfo> | undefined,
  paymentsStatus: "payable" | "processed" | undefined,
  completedPaymentNoticeCodes: ReadonlyArray<string> | undefined
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const modifiedState =
    payments?.reduce(
      (previousState, payment) =>
        paymentsStatus === "payable"
          ? appReducer(
              previousState,
              updatePaymentForMessage.success({
                messageId,
                paymentId: ``,
                paymentData: {
                  codiceContestoPagamento: `${payment.noticeCode}`,
                  importoSingoloVersamento: 99,
                  causaleVersamento: "Causale",
                  dueDate: new Date(2023, 10, 23, 10, 30)
                } as PaymentRequestsGetResponse
              })
            )
          : paymentsStatus === "processed"
          ? appReducer(
              previousState,
              updatePaymentForMessage.failure({
                messageId,
                paymentId: ``,
                details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO
              })
            )
          : previousState,
      globalState
    ) ?? globalState;
  const store = createStore(appReducer, modifiedState as any);

  const mockPresentPaymentsBottomSheetRef = {
    current: () => undefined
  };

  return renderScreenWithNavigationStoreContext(
    () => (
      <MessagePayments
        messageId={messageId}
        isCancelled={isCancelled}
        payments={payments}
        completedPaymentNoticeCodes={completedPaymentNoticeCodes}
        maxVisiblePaymentCount={5}
        presentPaymentsBottomSheetRef={mockPresentPaymentsBottomSheetRef}
      />
    ),
    "DUMMY",
    {},
    store
  );
};

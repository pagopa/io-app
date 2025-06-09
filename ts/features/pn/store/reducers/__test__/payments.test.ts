import { appReducer } from "../../../../../store/reducers";
import { updatePaymentForMessage } from "../../../../messages/store/actions";
import { UIMessageId } from "../../../../messages/types";
import { paymentsButtonStateSelector } from "../payments";
import { Detail_v2Enum } from "../../../../../../definitions/payments/PaymentProblemJson";
import { reproduceSequence } from "../../../../../utils/tests";
import { GlobalState } from "../../../../../store/reducers/types";
import { Action } from "../../../../../store/actions/types";
import { NotificationPaymentInfo } from "../../../../../../definitions/pn/NotificationPaymentInfo";
import { ServiceId } from "../../../../../../definitions/services/ServiceId";

describe("paymentsButtonStateSelector", () => {
  it("should return hidden for an unmatching message Id on store", () => {
    const updatePaymentForMessageAction = updatePaymentForMessage.request({
      messageId: "m1" as UIMessageId,
      paymentId: "p1",
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
    });
    const startingState = appReducer(undefined, updatePaymentForMessageAction);
    const buttonState = paymentsButtonStateSelector(
      startingState,
      "m2" as UIMessageId,
      undefined,
      5
    );
    expect(buttonState).toBe("hidden");
  });
  it("should return hidden when all visible payments are processed", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n1",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO,
        serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
      }),
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n2",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO,
        serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
      }),
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n3",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO,
        serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
      }),
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n4",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO,
        serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
      }),
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n5",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO,
        serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
      })
    ];
    const appState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );
    const payments = [
      {
        noticeCode: "n1",
        creditorTaxId: "c1"
      },
      {
        noticeCode: "n2",
        creditorTaxId: "c1"
      },
      {
        noticeCode: "n3",
        creditorTaxId: "c1"
      },
      {
        noticeCode: "n4",
        creditorTaxId: "c1"
      },
      {
        noticeCode: "n5",
        creditorTaxId: "c1"
      }
    ] as Array<NotificationPaymentInfo>;
    const buttonState = paymentsButtonStateSelector(
      appState,
      "m1" as UIMessageId,
      payments,
      5
    );
    expect(buttonState).toBe("hidden");
  });
  it("should return visibleLoading when all visible payments are processing", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n6",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO,
        serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
      }),
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n7",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO,
        serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
      }),
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n8",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO,
        serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
      }),
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n9",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO,
        serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
      }),
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n10",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO,
        serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
      })
    ];
    const appState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );
    const payments = [
      {
        noticeCode: "n1",
        creditorTaxId: "c1"
      },
      {
        noticeCode: "n2",
        creditorTaxId: "c1"
      },
      {
        noticeCode: "n3",
        creditorTaxId: "c1"
      },
      {
        noticeCode: "n4",
        creditorTaxId: "c1"
      },
      {
        noticeCode: "n5",
        creditorTaxId: "c1"
      }
    ] as Array<NotificationPaymentInfo>;
    const buttonState = paymentsButtonStateSelector(
      appState,
      "m1" as UIMessageId,
      payments,
      5
    );
    expect(buttonState).toBe("visibleLoading");
  });
  it("should return visibleEnabled when at least one visible payment has completed processing", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n5",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO,
        serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
      }),
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n7",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO,
        serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
      }),
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n8",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO,
        serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
      }),
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n9",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO,
        serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
      }),
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n10",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO,
        serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
      })
    ];
    const appState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );
    const payments = [
      {
        noticeCode: "n1",
        creditorTaxId: "c1"
      },
      {
        noticeCode: "n2",
        creditorTaxId: "c1"
      },
      {
        noticeCode: "n3",
        creditorTaxId: "c1"
      },
      {
        noticeCode: "n4",
        creditorTaxId: "c1"
      },
      {
        noticeCode: "n5",
        creditorTaxId: "c1"
      }
    ] as Array<NotificationPaymentInfo>;
    const buttonState = paymentsButtonStateSelector(
      appState,
      "m1" as UIMessageId,
      payments,
      5
    );
    expect(buttonState).toBe("visibleEnabled");
  });
});

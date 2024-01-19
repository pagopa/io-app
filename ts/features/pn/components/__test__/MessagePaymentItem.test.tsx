import React from "react";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { MessagePaymentItem } from "../MessagePaymentItem";
import { UIMessageId } from "../../../messages/types";
import { NotificationPaymentInfo } from "../../../../../definitions/pn/NotificationPaymentInfo";
import { updatePaymentForMessage } from "../../store/actions";
import { PaymentRequestsGetResponse } from "../../../../../definitions/backend/PaymentRequestsGetResponse";
import { Detail_v2Enum } from "../../../../../definitions/backend/PaymentProblemJson";

describe("MessagePaymentItem component", () => {
  it("Should match the snapshot for a loading item", () => {
    const messageId = "m1" as UIMessageId;
    const notificationPaymentInfo = {
      creditorTaxId: "",
      noticeCode: ""
    } as NotificationPaymentInfo;
    const component = renderComponent(messageId, notificationPaymentInfo);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match the snapshot for a payable item", () => {
    const messageId = "m1" as UIMessageId;
    const notificationPaymentInfo = {
      creditorTaxId: "c1",
      noticeCode: "n1"
    } as NotificationPaymentInfo;
    const component = renderComponent(
      messageId,
      notificationPaymentInfo,
      "payable"
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match the snapshot for a processed item", () => {
    const messageId = "m1" as UIMessageId;
    const notificationPaymentInfo = {
      creditorTaxId: "c1",
      noticeCode: "n1"
    } as NotificationPaymentInfo;
    const component = renderComponent(
      messageId,
      notificationPaymentInfo,
      "processed"
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = (
  messageId: UIMessageId,
  payment: NotificationPaymentInfo,
  paymentStatus: "payable" | "processed" | undefined = undefined
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const modifiedState =
    paymentStatus === "payable"
      ? appReducer(
          globalState,
          updatePaymentForMessage.success({
            messageId,
            paymentId: `${payment.creditorTaxId}${payment.noticeCode}`,
            paymentData: {
              codiceContestoPagamento: `${payment.noticeCode}`,
              importoSingoloVersamento: 99,
              causaleVersamento: "Causale",
              dueDate: new Date(2023, 10, 23, 10, 30)
            } as PaymentRequestsGetResponse
          })
        )
      : paymentStatus === "processed"
      ? appReducer(
          globalState,
          updatePaymentForMessage.failure({
            messageId,
            paymentId: `${payment.creditorTaxId}${payment.noticeCode}`,
            details: Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO
          })
        )
      : globalState;
  const store = createStore(appReducer, modifiedState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <MessagePaymentItem index={0} messageId={messageId} payment={payment} />
    ),
    "DUMMY",
    {},
    store
  );
};

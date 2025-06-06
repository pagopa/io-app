import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MessagePaymentItem } from "../MessagePaymentItem";
import { UIMessageId } from "../../../types";
import { NotificationPaymentInfo } from "../../../../../../definitions/pn/NotificationPaymentInfo";
import { Detail_v2Enum } from "../../../../../../definitions/payments/PaymentProblemJson";
import { updatePaymentForMessage } from "../../../store/actions";
import { PaymentRequestsGetResponse } from "../../../../../../definitions/payments/PaymentRequestsGetResponse";
import { ServiceId } from "../../../../../../definitions/services/ServiceId";

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
  const rptId = `${payment.creditorTaxId}${payment.noticeCode}`;
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const modifiedState =
    paymentStatus === "payable"
      ? appReducer(
          globalState,
          updatePaymentForMessage.success({
            messageId,
            paymentId: rptId,
            paymentData: {
              codiceContestoPagamento: `${payment.noticeCode}`,
              importoSingoloVersamento: 99,
              causaleVersamento: "Causale",
              dueDate: new Date(2023, 10, 23, 10, 30)
            } as PaymentRequestsGetResponse,
            serviceId: "01J5X5NP84QE3T3P604MWP9TKC" as ServiceId
          })
        )
      : paymentStatus === "processed"
      ? appReducer(
          globalState,
          updatePaymentForMessage.failure({
            messageId,
            paymentId: rptId,
            details: Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO,
            serviceId: "01J5X5NP84QE3T3P604MWP9TKC" as ServiceId
          })
        )
      : globalState;
  const store = createStore(appReducer, modifiedState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <MessagePaymentItem
        index={0}
        messageId={messageId}
        rptId={rptId}
        noticeNumber={payment.noticeCode}
        serviceId={"01J5X34VA7H1726CQNTG14GNDH" as ServiceId}
      />
    ),
    "DUMMY",
    {},
    store
  );
};

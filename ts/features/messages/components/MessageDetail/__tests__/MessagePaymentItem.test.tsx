import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MessagePaymentItem } from "../MessagePaymentItem";
import { NotificationPaymentInfo } from "../../../../../../definitions/pn/NotificationPaymentInfo";
import { Detail_v2Enum } from "../../../../../../definitions/backend/PaymentProblemJson";
import {
  toSpecificError,
  updatePaymentForMessage
} from "../../../store/actions";
import { PaymentInfoResponse } from "../../../../../../definitions/backend/PaymentInfoResponse";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { GlobalState } from "../../../../../store/reducers/types";

describe("MessagePaymentItem component", () => {
  it("Should match the snapshot for a loading item", () => {
    const messageId = "m1";
    const notificationPaymentInfo = {
      creditorTaxId: "",
      noticeCode: ""
    } as NotificationPaymentInfo;
    const component = renderComponent(messageId, notificationPaymentInfo);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match the snapshot for a payable item", () => {
    const messageId = "m1";
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
  it("Should match the snapshot for a payable-without-expiration item", () => {
    const messageId = "m1";
    const notificationPaymentInfo = {
      creditorTaxId: "c1",
      noticeCode: "n1"
    } as NotificationPaymentInfo;
    const component = renderComponent(
      messageId,
      notificationPaymentInfo,
      "payable-without-expiration"
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match the snapshot for a processed item", () => {
    const messageId = "m1";
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

const appStateByPaymentStatus = {
  payable: (
    globalState: GlobalState,
    messageId: string,
    rptId: string,
    payment: NotificationPaymentInfo
  ) =>
    appReducer(
      globalState,
      updatePaymentForMessage.success({
        messageId,
        paymentId: rptId,
        paymentData: {
          rptId: `${payment.noticeCode}`,
          amount: 99,
          description: "Causale",
          dueDate: new Date(2023, 10, 23, 10, 30)
        } as PaymentInfoResponse,
        serviceId: "01J5X5NP84QE3T3P604MWP9TKC" as ServiceId
      })
    ),
  "payable-without-expiration": (
    globalState: GlobalState,
    messageId: string,
    rptId: string,
    payment: NotificationPaymentInfo
  ) =>
    appReducer(
      globalState,
      updatePaymentForMessage.success({
        messageId,
        paymentId: rptId,
        paymentData: {
          rptId: `${payment.noticeCode}`,
          amount: 99,
          description: "Causale",
          dueDate: new Date(2099, 10, 23, 10, 30)
        } as PaymentInfoResponse,
        serviceId: "01J5X5NP84QE3T3P604MWP9TKC" as ServiceId
      })
    ),
  processed: (globalState: GlobalState, messageId: string, rptId: string) =>
    appReducer(
      globalState,
      updatePaymentForMessage.failure({
        messageId,
        paymentId: rptId,
        reason: toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO),
        serviceId: "01J5X5NP84QE3T3P604MWP9TKC" as ServiceId
      })
    )
};

const renderComponent = (
  messageId: string,
  payment: NotificationPaymentInfo,
  paymentStatus:
    | "payable"
    | "processed"
    | "payable-without-expiration"
    | undefined = undefined
) => {
  const rptId = `${payment.creditorTaxId}${payment.noticeCode}`;
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const modifiedState = paymentStatus
    ? appStateByPaymentStatus[paymentStatus](
        globalState,
        messageId,
        rptId,
        payment
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

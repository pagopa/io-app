import { sendUserSelectedPaymentRptIdSelector } from "..";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { PNMessage } from "../../types/types";
import { GlobalState } from "../../../../../store/reducers/types";

describe("pnUserSelectedPaymentRptIdSelector", () => {
  const p3CreditorTaxId = "01234567890";
  const p3NoticeCode = "012345678912345630";
  const sendMessage = {
    recipients: [
      {
        payment: {
          noticeCode: "012345678912345610",
          creditorTaxId: "01234567890"
        }
      },
      {
        payment: {
          noticeCode: "012345678912345620",
          creditorTaxId: "01234567890"
        }
      },
      {
        payment: {
          noticeCode: p3NoticeCode,
          creditorTaxId: p3CreditorTaxId
        }
      }
    ]
  } as unknown as PNMessage;

  it("should return undefined when the message is undefined", () => {
    const appState = appReducer(undefined, applicationChangeState("active"));
    const pnUserSelectedPaymentRptId = sendUserSelectedPaymentRptIdSelector(
      appState,
      undefined
    );
    expect(pnUserSelectedPaymentRptId).toBeUndefined();
  });
  it("should return undefined when recipients are empty", () => {
    const appState = appReducer(undefined, applicationChangeState("active"));
    const emptyRecipientsSendMessage = {
      recipients: []
    } as unknown as PNMessage;
    const pnUserSelectedPaymentRptId = sendUserSelectedPaymentRptIdSelector(
      appState,
      emptyRecipientsSendMessage
    );
    expect(pnUserSelectedPaymentRptId).toBeUndefined();
  });
  it("should return undefined when recipients do not have a payment", () => {
    const appState = appReducer(undefined, applicationChangeState("active"));
    const noPaymentsSendMessage = {
      recipients: [{}, {}, {}]
    } as unknown as PNMessage;
    const pnUserSelectedPaymentRptId = sendUserSelectedPaymentRptIdSelector(
      appState,
      noPaymentsSendMessage
    );
    expect(pnUserSelectedPaymentRptId).toBeUndefined();
  });
  it("should return undefined when there are no user selected payments", () => {
    const appState = appReducer(undefined, applicationChangeState("active"));
    const pnUserSelectedPaymentRptId = sendUserSelectedPaymentRptIdSelector(
      appState,
      sendMessage
    );
    expect(pnUserSelectedPaymentRptId).toBeUndefined();
  });
  it("should return undefined when user selected payments do not match", () => {
    const appState = appReducer(undefined, applicationChangeState("active"));
    const rptId = `${p3CreditorTaxId}${p3NoticeCode}`;
    const userSelectedPayments =
      appState.entities.messages.payments.userSelectedPayments;
    userSelectedPayments.add(rptId);
    const finalState = {
      ...appState,
      entities: {
        ...appState.entities,
        messages: {
          ...appState.entities.messages,
          payments: {
            ...appState.entities.messages.payments,
            userSelectedPayments
          }
        }
      }
    } as GlobalState;
    const pnUserSelectedPaymentRptId = sendUserSelectedPaymentRptIdSelector(
      finalState,
      sendMessage
    );
    expect(pnUserSelectedPaymentRptId).toBe(rptId);
  });
});

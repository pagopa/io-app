import { pnReducer, sendUserSelectedPaymentRptIdSelector } from "..";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { ThirdPartyMessage } from "../../../../../../definitions/pn/ThirdPartyMessage";

describe("pnReducer", () => {
  it("should match snapshot", () => {
    const output = pnReducer(undefined, applicationChangeState("active"));
    expect(output).toMatchSnapshot();
  });
});

describe("sendUserSelectedPaymentRptIdSelector", () => {
  const p3CreditorTaxId = "01234567890";
  const p3NoticeCode = "012345678912345630";
  const sendMessage = {
    details: {
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
    }
  } as unknown as ThirdPartyMessage;

  it("should return undefined when the message is undefined", () => {
    const appState = appReducer(undefined, applicationChangeState("active"));
    const sendUserSelectedPaymentRptId = sendUserSelectedPaymentRptIdSelector(
      appState,
      undefined
    );
    expect(sendUserSelectedPaymentRptId).toBeUndefined();
  });
  it("should return undefined when recipients are empty", () => {
    const appState = appReducer(undefined, applicationChangeState("active"));
    const emptyRecipientsSendMessage = {
      details: {
        recipients: []
      }
    } as unknown as ThirdPartyMessage;
    const sendUserSelectedPaymentRptId = sendUserSelectedPaymentRptIdSelector(
      appState,
      emptyRecipientsSendMessage
    );
    expect(sendUserSelectedPaymentRptId).toBeUndefined();
  });
  it("should return undefined when recipients do not have a payment", () => {
    const appState = appReducer(undefined, applicationChangeState("active"));
    const noPaymentsSendMessage = {
      details: {
        recipients: [{}, {}, {}]
      }
    } as unknown as ThirdPartyMessage;
    const sendUserSelectedPaymentRptId = sendUserSelectedPaymentRptIdSelector(
      appState,
      noPaymentsSendMessage
    );
    expect(sendUserSelectedPaymentRptId).toBeUndefined();
  });
  it("should return undefined when there are no user selected payments", () => {
    const appState = appReducer(undefined, applicationChangeState("active"));
    const sendUserSelectedPaymentRptId = sendUserSelectedPaymentRptIdSelector(
      appState,
      sendMessage
    );
    expect(sendUserSelectedPaymentRptId).toBeUndefined();
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
    const sendUserSelectedPaymentRptId = sendUserSelectedPaymentRptIdSelector(
      finalState,
      sendMessage
    );
    expect(sendUserSelectedPaymentRptId).toBe(rptId);
  });
});

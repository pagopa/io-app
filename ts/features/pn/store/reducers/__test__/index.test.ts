import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  curriedSendMessageFromIdSelector,
  pnReducer,
  sendUserSelectedPaymentRptIdSelector
} from "..";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { PNMessage } from "../../types/types";
import { GlobalState } from "../../../../../store/reducers/types";

describe("pnReducer", () => {
  it("should match snapshot", () => {
    const output = pnReducer(undefined, applicationChangeState("active"));
    expect(output).toMatchSnapshot();
  });
});

describe("curriedSendMessageFromIdSelector", () => {
  const sendMessageId = "01K9S27NM5BFCJWYFB71F2HT8Y";
  it("should be a curried function returning a selector, for memoization reasons", () => {
    const selector = curriedSendMessageFromIdSelector(sendMessageId);
    const resultFunction = selector.resultFunc;
    expect(resultFunction).not.toBeNull(); // make sure the selector is defined with `createSelector`
    const argumentCount = resultFunction.length;
    expect(argumentCount).toBe(1); // the returned selector should only have the state as argument
  });
  it("should return undefined when there is nothing in the store", () => {
    const state = {
      entities: {
        messages: {
          thirdPartyById: {}
        }
      }
    } as GlobalState;
    const output = curriedSendMessageFromIdSelector(sendMessageId)(state);
    expect(output).toBeUndefined();
  });
  const sendMessage = {
    attachments: [
      {
        id: "1",
        url: "https://an.url/path"
      }
    ],
    details: {
      iun: "8fe88d0f-05fa-425e-bf35-24ec23be4d3c",
      notificationStatusHistory: [
        {
          activeFrom: new Date(),
          relatedTimelineElements: [],
          status: "ACCEPTED"
        }
      ],
      recipients: [
        {
          denomination: "The denomination",
          payment: {
            creditorTaxId: "01234567890",
            noticeCode: "111122223333444400"
          },
          recipientType: "PF",
          taxId: "RSSMGV80A41H501I"
        }
      ],
      subject: "Subject"
    }
  };
  const thirdPartyMessage = {
    created_at: new Date(),
    third_party_message: sendMessage
  };
  [
    pot.none,
    pot.noneLoading,
    pot.noneUpdating(thirdPartyMessage),
    pot.noneError(Error("")),
    pot.some(thirdPartyMessage),
    pot.someLoading(thirdPartyMessage),
    pot.someUpdating(thirdPartyMessage, thirdPartyMessage),
    pot.someError(thirdPartyMessage, Error(""))
  ].forEach(inputPot => {
    const shouldReturnSendMessage = pot.isSome(inputPot);
    it(`should return ${
      shouldReturnSendMessage ? "the SEND message" : "undefined"
    } when the input data is a ${inputPot.kind}`, () => {
      const state = {
        entities: {
          messages: {
            thirdPartyById: {
              [sendMessageId]: inputPot
            }
          }
        }
      } as unknown as GlobalState;
      const output = curriedSendMessageFromIdSelector(sendMessageId)(state);
      if (shouldReturnSendMessage) {
        expect(output).toEqual({
          attachments: sendMessage.attachments,
          created_at: thirdPartyMessage.created_at,
          ...sendMessage.details
        });
      } else {
        expect(output).toBeUndefined();
      }
    });
  });
  it("should return undefined if the SEND third party message format is not valid", () => {
    const state = {
      entities: {
        messages: {
          thirdPartyById: {
            [sendMessageId]: pot.some({
              third_party_message: {
                ...sendMessage,
                attachments: [
                  {
                    id: "1"
                  }
                ]
              }
            })
          }
        }
      }
    } as unknown as GlobalState;
    const output = curriedSendMessageFromIdSelector(sendMessageId)(state);
    expect(output).toBeUndefined();
  });
  it("should return undefined if the third party message format is valid but there is no details property", () => {
    const state = {
      entities: {
        messages: {
          thirdPartyById: {
            [sendMessageId]: pot.some({
              third_party_message: {
                ...sendMessage,
                details: undefined
              }
            })
          }
        }
      }
    } as unknown as GlobalState;
    const output = curriedSendMessageFromIdSelector(sendMessageId)(state);
    expect(output).toBeUndefined();
  });
});

describe("sendUserSelectedPaymentRptIdSelector", () => {
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
    const sendUserSelectedPaymentRptId = sendUserSelectedPaymentRptIdSelector(
      appState,
      undefined
    );
    expect(sendUserSelectedPaymentRptId).toBeUndefined();
  });
  it("should return undefined when recipients are empty", () => {
    const appState = appReducer(undefined, applicationChangeState("active"));
    const emptyRecipientsSendMessage = {
      recipients: []
    } as unknown as PNMessage;
    const sendUserSelectedPaymentRptId = sendUserSelectedPaymentRptIdSelector(
      appState,
      emptyRecipientsSendMessage
    );
    expect(sendUserSelectedPaymentRptId).toBeUndefined();
  });
  it("should return undefined when recipients do not have a payment", () => {
    const appState = appReducer(undefined, applicationChangeState("active"));
    const noPaymentsSendMessage = {
      recipients: [{}, {}, {}]
    } as unknown as PNMessage;
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

import { Detail_v2Enum } from "../../../../../../definitions/backend/PaymentProblemJson";
import { PaymentRequestsGetResponse } from "../../../../../../definitions/backend/PaymentRequestsGetResponse";
import { NotificationPaymentInfo } from "../../../../../../definitions/pn/NotificationPaymentInfo";
import { reloadAllMessages } from "../../../../messages/store/actions";
import { Action } from "../../../../../store/actions/types";
import { appReducer } from "../../../../../store/reducers";
import { UIMessageId } from "../../../../messages/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { reproduceSequence } from "../../../../../utils/tests";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined
} from "../../../../../common/model/RemoteValue";
import {
  clearMessagesSelectedPayment,
  setMessagesSelectedPayment,
  updatePaymentForMessage
} from "../../actions";
import {
  initialState,
  paymentStatusForUISelector,
  paymentsButtonStateSelector,
  paymentsReducer,
  selectedPaymentIdSelector,
  shouldUpdatePaymentSelector
} from "../../../../messages/store/reducers/payments";

describe("PN Payments reducer's tests", () => {
  it("Should match initial state upon initialization", () => {
    const firstState = paymentsReducer(undefined, {} as Action);
    expect(firstState).toEqual(initialState);
  });
  it("Should have undefined value for an undefined Message Id", () => {
    const requestAction = updatePaymentForMessage.request({
      messageId: "m1" as UIMessageId,
      paymentId: "p1"
    });
    const paymentsState = paymentsReducer(undefined, requestAction);
    const unknownMessageId = "m2" as UIMessageId;
    const messageState = paymentsState[unknownMessageId];
    expect(messageState).toBeUndefined();
  });
  it("Should have undefined value for an unknown paymentId", () => {
    const messageId = "m1" as UIMessageId;
    const requestAction = updatePaymentForMessage.request({
      messageId,
      paymentId: "p1"
    });
    const paymentsState = paymentsReducer(undefined, requestAction);
    const messageState = paymentsState[messageId];
    expect(messageState).toBeTruthy();
    const unknownPaymentId = "p2";
    const paymentState = messageState?.[unknownPaymentId];
    expect(paymentState).toBeUndefined();
  });
  it("Should have remoteLoading value for a updatePaymentForMessage.request", () => {
    const messageId = "m1" as UIMessageId;
    const paymentId = "p1";
    const requestAction = updatePaymentForMessage.request({
      messageId,
      paymentId
    });
    const paymentsState = paymentsReducer(undefined, requestAction);
    const messageState = paymentsState[messageId];
    expect(messageState).toBeTruthy();
    const paymentState = messageState?.[paymentId];
    expect(paymentState).toBe(remoteLoading);
  });
  it("Should have remoteReady value for a updatePaymentForMessage.success", () => {
    const messageId = "m1" as UIMessageId;
    const paymentId = "p1";
    const requestAction = updatePaymentForMessage.request({
      messageId,
      paymentId
    });
    const paymentsState = paymentsReducer(undefined, requestAction);
    const paymentData = {
      importoSingoloVersamento: 100,
      codiceContestoPagamento: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
    } as PaymentRequestsGetResponse;
    const successAction = updatePaymentForMessage.success({
      messageId,
      paymentId,
      paymentData
    });
    const updatedPaymentsState = paymentsReducer(paymentsState, successAction);
    const messageState = updatedPaymentsState[messageId];
    expect(messageState).toBeTruthy();
    const paymentState = messageState?.[paymentId];
    const remoteSuccessPaymentData = remoteReady(paymentData);
    expect(paymentState).toStrictEqual(remoteSuccessPaymentData);
  });
  it("Should have remoteError value for a updatePaymentForMessage.failure", () => {
    const messageId = "m1" as UIMessageId;
    const paymentId = "p1";
    const requestAction = updatePaymentForMessage.request({
      messageId,
      paymentId
    });
    const paymentsState = paymentsReducer(undefined, requestAction);
    const details = Detail_v2Enum.CANALE_BUSTA_ERRATA;
    const failureAction = updatePaymentForMessage.failure({
      messageId,
      paymentId,
      details
    });
    const updatedPaymentsState = paymentsReducer(paymentsState, failureAction);
    const messageState = updatedPaymentsState[messageId];
    expect(messageState).toBeTruthy();
    const paymentState = messageState?.[paymentId];
    const remoteSuccessPaymentData = remoteError(details);
    expect(paymentState).toStrictEqual(remoteSuccessPaymentData);
  });
  it("Should handle multiple payments for a single message", () => {
    const messageId = "m1" as UIMessageId;
    const paymentId1 = "p1";
    const requestAction = updatePaymentForMessage.request({
      messageId,
      paymentId: paymentId1
    });
    const firstStateGeneration = paymentsReducer(undefined, requestAction);
    const paymentId2 = "p2";
    const secondPaymentData = {
      importoSingoloVersamento: 100,
      codiceContestoPagamento: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
    } as PaymentRequestsGetResponse;
    const successAction = updatePaymentForMessage.success({
      messageId,
      paymentId: paymentId2,
      paymentData: secondPaymentData
    });
    const secondStateGeneration = paymentsReducer(
      firstStateGeneration,
      successAction
    );
    const paymentId3 = "p3";
    const thirdPaymentDetails = Detail_v2Enum.CANALE_BUSTA_ERRATA;
    const failureAction = updatePaymentForMessage.failure({
      messageId,
      paymentId: paymentId3,
      details: thirdPaymentDetails
    });
    const finalStateGeneration = paymentsReducer(
      secondStateGeneration,
      failureAction
    );
    const messageState = finalStateGeneration[messageId];
    expect(messageState).toBeTruthy();
    const firstPaymentState = messageState?.[paymentId1];
    expect(firstPaymentState).toBe(remoteLoading);
    const secondPaymentState = messageState?.[paymentId2];
    expect(secondPaymentState).toStrictEqual(remoteReady(secondPaymentData));
    const thirdPaymentState = messageState?.[paymentId3];
    expect(thirdPaymentState).toStrictEqual(remoteError(thirdPaymentDetails));
  });
  it("Should handle multiple payments for multiple messages", () => {
    const messageId1 = "m1" as UIMessageId;
    const paymentId1 = "p1";
    const requestAction = updatePaymentForMessage.request({
      messageId: messageId1,
      paymentId: paymentId1
    });
    const firstStateGeneration = paymentsReducer(undefined, requestAction);
    const messageId2 = "m2" as UIMessageId;
    const successfulPaymentData = {
      importoSingoloVersamento: 100,
      codiceContestoPagamento: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
    } as PaymentRequestsGetResponse;
    const successAction = updatePaymentForMessage.success({
      messageId: messageId2,
      paymentId: paymentId1,
      paymentData: successfulPaymentData
    });
    const secondStateGeneration = paymentsReducer(
      firstStateGeneration,
      successAction
    );
    const messageId3 = "m3" as UIMessageId;
    const failedPaymentDetails = Detail_v2Enum.CANALE_BUSTA_ERRATA;
    const failureAction = updatePaymentForMessage.failure({
      messageId: messageId3,
      paymentId: paymentId1,
      details: failedPaymentDetails
    });
    const finalStateGeneration = paymentsReducer(
      secondStateGeneration,
      failureAction
    );
    const message1State = finalStateGeneration[messageId1];
    expect(message1State).toBeTruthy();
    const firstPaymentState = message1State?.[paymentId1];
    expect(firstPaymentState).toBe(remoteLoading);
    const message2State = finalStateGeneration[messageId2];
    expect(message2State).toBeTruthy();
    const secondPaymentState = message2State?.[paymentId1];
    expect(secondPaymentState).toStrictEqual(
      remoteReady(successfulPaymentData)
    );
    const message3State = finalStateGeneration[messageId3];
    expect(message3State).toBeTruthy();
    const thirdPaymentState = message3State?.[paymentId1];
    expect(thirdPaymentState).toStrictEqual(remoteError(failedPaymentDetails));
  });
  it("Should remove payment statuses on updatePaymentForMessage.cancel", () => {
    const messageId1 = "m1" as UIMessageId;
    const paymentId1 = "p1";
    const requestAction1 = updatePaymentForMessage.request({
      messageId: messageId1,
      paymentId: paymentId1
    });
    const firstStateGeneration = paymentsReducer(undefined, requestAction1);
    const messageId2 = "m2" as UIMessageId;
    const requestAction2 = updatePaymentForMessage.request({
      messageId: messageId2,
      paymentId: paymentId1
    });
    const secondStateGeneration = paymentsReducer(
      firstStateGeneration,
      requestAction2
    );
    const paymentId2 = "p2";
    const requestAction3 = updatePaymentForMessage.request({
      messageId: messageId2,
      paymentId: paymentId2
    });
    const thirdStateGeneration = paymentsReducer(
      secondStateGeneration,
      requestAction3
    );
    const messageId3 = "m3" as UIMessageId;
    const requestAction4 = updatePaymentForMessage.request({
      messageId: messageId3,
      paymentId: paymentId1
    });
    const fourthStateGeneration = paymentsReducer(
      thirdStateGeneration,
      requestAction4
    );
    const requestAction5 = updatePaymentForMessage.request({
      messageId: messageId3,
      paymentId: paymentId2
    });
    const fifthStateGeneration = paymentsReducer(
      fourthStateGeneration,
      requestAction5
    );
    const paymentId3 = "p3";
    const requestAction6 = updatePaymentForMessage.request({
      messageId: messageId3,
      paymentId: paymentId3
    });
    const sixthStateGeneration = paymentsReducer(
      fifthStateGeneration,
      requestAction6
    );

    const m1S1 = sixthStateGeneration[messageId1];
    expect(m1S1).toBeTruthy();
    const m1p1S1 = m1S1?.[paymentId1];
    expect(m1p1S1).toStrictEqual(remoteLoading);

    const m2S1 = sixthStateGeneration[messageId2];
    expect(m2S1).toBeTruthy();
    const m2p1S1 = m2S1?.[paymentId1];
    expect(m2p1S1).toStrictEqual(remoteLoading);
    const m2p2S1 = m2S1?.[paymentId2];
    expect(m2p2S1).toStrictEqual(remoteLoading);

    const m3S1 = sixthStateGeneration[messageId3];
    expect(m3S1).toBeTruthy();
    const m3p1S1 = m3S1?.[paymentId1];
    expect(m3p1S1).toStrictEqual(remoteLoading);
    const m3p2S1 = m3S1?.[paymentId2];
    expect(m3p2S1).toStrictEqual(remoteLoading);
    const m3p3S1 = m3S1?.[paymentId3];
    expect(m3p3S1).toStrictEqual(remoteLoading);

    const cancelPaymentAction = updatePaymentForMessage.cancel([
      {
        messageId: messageId1,
        paymentId: paymentId1
      },
      {
        messageId: messageId2,
        paymentId: paymentId2
      },
      {
        messageId: messageId3,
        paymentId: paymentId2
      },
      {
        messageId: messageId3,
        paymentId: paymentId3
      }
    ]);
    const finalStateGeneration = paymentsReducer(
      sixthStateGeneration,
      cancelPaymentAction
    );

    const m1S2 = finalStateGeneration[messageId1];
    expect(m1S2).toBeTruthy();
    const m1p1S2 = m1S2?.[paymentId1];
    expect(m1p1S2).toBeUndefined();

    const m2S2 = finalStateGeneration[messageId2];
    expect(m2S2).toBeTruthy();
    const m2p1S2 = m2S2?.[paymentId1];
    expect(m2p1S2).toStrictEqual(remoteLoading);
    const m2p2S2 = m2S2?.[paymentId2];
    expect(m2p2S2).toBeUndefined();

    const m3S2 = finalStateGeneration[messageId3];
    expect(m3S2).toBeTruthy();
    const m3p1S2 = m3S2?.[paymentId1];
    expect(m3p1S2).toStrictEqual(remoteLoading);
    const m3p2S2 = m3S2?.[paymentId2];
    expect(m3p2S2).toBeUndefined();
    const m3p3S2 = m3S2?.[paymentId3];
    expect(m3p3S2).toBeUndefined();
  });
  it("Should have the paymentId for a setSelectedPayment action", () => {
    const paymentId = "p1";
    const setSelectedPaymentAction = setMessagesSelectedPayment(paymentId);
    const paymentsState = paymentsReducer(undefined, setSelectedPaymentAction);
    const selectedPaymentId = paymentsState.selectedPayment;
    expect(selectedPaymentId).toBe(paymentId);
  });
  it("Should clear the paymentId for a clearSelectedPayment action", () => {
    const paymentId = "p1";
    const setSelectedPaymentAction = setMessagesSelectedPayment(paymentId);
    const startingPaymentsState = paymentsReducer(
      undefined,
      setSelectedPaymentAction
    );
    const startingSelectedPaymentId = startingPaymentsState.selectedPayment;
    expect(startingSelectedPaymentId).toBe(paymentId);
    const endingPaymentsState = paymentsReducer(
      startingPaymentsState,
      clearMessagesSelectedPayment()
    );
    const endingSelectedPaymentId = endingPaymentsState.selectedPayment;
    expect(endingSelectedPaymentId).toBeUndefined();
  });
  it("Should clear the paymentId for a reloadAllMessages action", () => {
    const paymentId = "p1";
    const setSelectedPaymentAction = setMessagesSelectedPayment(paymentId);
    const startingPaymentsState = paymentsReducer(
      undefined,
      setSelectedPaymentAction
    );
    const startingSelectedPaymentId = startingPaymentsState.selectedPayment;
    expect(startingSelectedPaymentId).toBe(paymentId);
    const endingPaymentsState = paymentsReducer(
      startingPaymentsState,
      reloadAllMessages.request({ pageSize: 12, filter: {} })
    );
    const endingSelectedPaymentId = endingPaymentsState.selectedPayment;
    expect(endingSelectedPaymentId).toBeUndefined();
  });
});

describe("PN Payments selectors' tests", () => {
  it("shouldUpdatePaymentSelector should return true for an unmatching message Id", () => {
    const startingState = appReducer(undefined, {} as Action);
    const updatePaymentForMessageAction = updatePaymentForMessage.request({
      messageId: "m1" as UIMessageId,
      paymentId: "p1"
    });
    const state = appReducer(startingState, updatePaymentForMessageAction);
    const shouldUpdatePayment = shouldUpdatePaymentSelector(
      state,
      "m2" as UIMessageId,
      "p1"
    );
    expect(shouldUpdatePayment).toBeTruthy();
  });
  it("shouldUpdatePaymentSelector should return true for a matching message Id with an unmatching payment Id", () => {
    const startingState = appReducer(undefined, {} as Action);
    const updatePaymentForMessageAction = updatePaymentForMessage.request({
      messageId: "m1" as UIMessageId,
      paymentId: "p1"
    });
    const state = appReducer(startingState, updatePaymentForMessageAction);
    const shouldUpdatePayment = shouldUpdatePaymentSelector(
      state,
      "m1" as UIMessageId,
      "p2"
    );
    expect(shouldUpdatePayment).toBeTruthy();
  });
  it("shouldUpdatePaymentSelector should return false for a matching <message Id, payment Id> pair", () => {
    const startingState = appReducer(undefined, {} as Action);
    const updatePaymentForMessageAction = updatePaymentForMessage.request({
      messageId: "m1" as UIMessageId,
      paymentId: "p1"
    });
    const state = appReducer(startingState, updatePaymentForMessageAction);
    const shouldUpdatePayment = shouldUpdatePaymentSelector(
      state,
      "m1" as UIMessageId,
      "p1"
    );
    expect(shouldUpdatePayment).toBeFalsy();
  });
  it("paymentStatusForUISelector should return remoteUndefined for an unmatching message Id", () => {
    const startingState = appReducer(undefined, {} as Action);
    const updatePaymentForMessageAction = updatePaymentForMessage.request({
      messageId: "m1" as UIMessageId,
      paymentId: "p1"
    });
    const state = appReducer(startingState, updatePaymentForMessageAction);
    const paymentStatus = paymentStatusForUISelector(
      state,
      "m2" as UIMessageId,
      "p1"
    );
    expect(paymentStatus).toBe(remoteUndefined);
  });
  it("paymentStatusForUISelector should return remoteUndefined for a matching message Id with an unmatching payment Id", () => {
    const startingState = appReducer(undefined, {} as Action);
    const updatePaymentForMessageAction = updatePaymentForMessage.request({
      messageId: "m1" as UIMessageId,
      paymentId: "p1"
    });
    const state = appReducer(startingState, updatePaymentForMessageAction);
    const paymentStatus = paymentStatusForUISelector(
      state,
      "m1" as UIMessageId,
      "p2"
    );
    expect(paymentStatus).toBe(remoteUndefined);
  });
  it("paymentStatusForUISelector should return remoteUndefined for a matching <message Id, payment Id> that is loading", () => {
    const startingState = appReducer(undefined, {} as Action);
    const updatePaymentForMessageAction = updatePaymentForMessage.request({
      messageId: "m1" as UIMessageId,
      paymentId: "p1"
    });
    const state = appReducer(startingState, updatePaymentForMessageAction);
    const paymentStatusOnStore =
      state.entities.messages.payments["m1" as UIMessageId]?.p1;
    expect(paymentStatusOnStore).toBe(remoteLoading);
    const paymentStatus = paymentStatusForUISelector(
      state,
      "m1" as UIMessageId,
      "p1"
    );
    expect(paymentStatus).toBe(remoteUndefined);
  });
  it("paymentStatusForUISelector should return remoteReady for a matching <message Id, payment Id> that is payable", () => {
    const paymentData = {} as PaymentRequestsGetResponse;
    const startingState = appReducer(undefined, {} as Action);
    const updatePaymentForMessageAction = updatePaymentForMessage.success({
      messageId: "m1" as UIMessageId,
      paymentId: "p1",
      paymentData
    });
    const state = appReducer(startingState, updatePaymentForMessageAction);
    const paymentStatus = paymentStatusForUISelector(
      state,
      "m1" as UIMessageId,
      "p1"
    );
    expect(paymentStatus).toStrictEqual(remoteReady(paymentData));
  });
  it("paymentStatusForUISelector should return remoteError for a matching <message Id, payment Id> that is not payable anymore", () => {
    const details = Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO;
    const startingState = appReducer(undefined, {} as Action);
    const updatePaymentForMessageAction = updatePaymentForMessage.failure({
      messageId: "m1" as UIMessageId,
      paymentId: "p1",
      details
    });
    const state = appReducer(startingState, updatePaymentForMessageAction);
    const paymentStatus = paymentStatusForUISelector(
      state,
      "m1" as UIMessageId,
      "p1"
    );
    expect(paymentStatus).toStrictEqual(remoteError(details));
  });
  it("paymentsButtonStateSelector should return hidden for an unmatching message Id on store", () => {
    const updatePaymentForMessageAction = updatePaymentForMessage.request({
      messageId: "m1" as UIMessageId,
      paymentId: "p1"
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
  it("paymentsButtonStateSelector should return hidden when all visible payments are processed", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n1",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO
      }),
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n2",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO
      }),
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n3",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO
      }),
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n4",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO
      }),
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n5",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO
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
  it("paymentsButtonStateSelector should return visibleLoading when all visible payments are processing", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n6",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO
      }),
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n7",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO
      }),
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n8",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO
      }),
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n9",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO
      }),
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n10",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO
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
  it("paymentsButtonStateSelector should return visibleEnabled when at least one visible payment has completed processing", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n5",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO
      }),
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n7",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO
      }),
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n8",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO
      }),
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n9",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO
      }),
      updatePaymentForMessage.failure({
        messageId: "m1" as UIMessageId,
        paymentId: "c1n10",
        details: Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO
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
  it("selectedPaymentIdSelector should return undefined when none is set", () => {
    const appState = appReducer(undefined, {} as Action);
    const selectedPaymentId = selectedPaymentIdSelector(appState);
    expect(selectedPaymentId).toBeUndefined();
  });
  it("selectedPaymentIdSelector should return the selected payment", () => {
    const appState = appReducer(undefined, setMessagesSelectedPayment("p1"));
    const selectedPaymentId = selectedPaymentIdSelector(appState);
    expect(selectedPaymentId).toBe("p1");
  });
});

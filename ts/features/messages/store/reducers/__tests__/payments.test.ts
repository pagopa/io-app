import * as pot from "@pagopa/ts-commons/lib/pot";
import { Detail_v2Enum } from "../../../../../../definitions/payments/PaymentProblemJson";
import { PaymentRequestsGetResponse } from "../../../../../../definitions/payments/PaymentRequestsGetResponse";
import { reloadAllMessages } from "../../../../messages/store/actions";
import { Action } from "../../../../../store/actions/types";
import { appReducer } from "../../../../../store/reducers";
import {
  PaymentData,
  UIMessageDetails,
  UIMessageId
} from "../../../../messages/types";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined
} from "../../../../../common/model/RemoteValue";
import {
  addUserSelectedPaymentRptId,
  updatePaymentForMessage
} from "../../actions";
import {
  initialState as paymentsInitialState,
  paymentStatusForUISelector,
  userSelectedPaymentRptIdSelector,
  paymentsReducer,
  shouldUpdatePaymentSelector,
  isUserSelectedPaymentSelector,
  canNavigateToPaymentFromMessageSelector,
  paymentsButtonStateSelector,
  isPaymentsButtonVisibleSelector
} from "../payments";
import { getRptIdStringFromPaymentData } from "../../../utils";
import { applicationChangeState } from "../../../../../store/actions/application";
import * as versionInfo from "../../../../../common/versionInfo/store/reducers/versionInfo";
import * as profile from "../../../../settings/common/store/selectors";
import { GlobalState } from "../../../../../store/reducers/types";
import { ServiceId } from "../../../../../../definitions/services/ServiceId";

describe("Messages payments reducer's tests", () => {
  it("Should match initial state upon initialization", () => {
    const firstState = paymentsReducer(undefined, {} as Action);
    expect(firstState).toEqual(paymentsInitialState);
  });
  it("Should have undefined value for an undefined Message Id", () => {
    const requestAction = updatePaymentForMessage.request({
      messageId: "m1" as UIMessageId,
      paymentId: "p1",
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
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
      paymentId: "p1",
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
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
      paymentId,
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
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
    const serviceId = "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId;
    const requestAction = updatePaymentForMessage.request({
      messageId,
      paymentId,
      serviceId
    });
    const paymentsState = paymentsReducer(undefined, requestAction);
    const paymentData = {
      importoSingoloVersamento: 100,
      codiceContestoPagamento: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
    } as PaymentRequestsGetResponse;
    const successAction = updatePaymentForMessage.success({
      messageId,
      paymentId,
      paymentData,
      serviceId
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
    const serviceId = "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId;
    const requestAction = updatePaymentForMessage.request({
      messageId,
      paymentId,
      serviceId
    });
    const paymentsState = paymentsReducer(undefined, requestAction);
    const details = Detail_v2Enum.CANALE_BUSTA_ERRATA;
    const failureAction = updatePaymentForMessage.failure({
      messageId,
      paymentId,
      details,
      serviceId
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
    const serviceId = "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId;
    const requestAction = updatePaymentForMessage.request({
      messageId,
      paymentId: paymentId1,
      serviceId
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
      paymentData: secondPaymentData,
      serviceId
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
      details: thirdPaymentDetails,
      serviceId
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
    const serviceId = "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId;
    const requestAction = updatePaymentForMessage.request({
      messageId: messageId1,
      paymentId: paymentId1,
      serviceId
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
      paymentData: successfulPaymentData,
      serviceId
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
      details: failedPaymentDetails,
      serviceId
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
    const serviceId = "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId;
    const requestAction1 = updatePaymentForMessage.request({
      messageId: messageId1,
      paymentId: paymentId1,
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
    });
    const firstStateGeneration = paymentsReducer(undefined, requestAction1);
    const messageId2 = "m2" as UIMessageId;
    const requestAction2 = updatePaymentForMessage.request({
      messageId: messageId2,
      paymentId: paymentId1,
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
    });
    const secondStateGeneration = paymentsReducer(
      firstStateGeneration,
      requestAction2
    );
    const paymentId2 = "p2";
    const requestAction3 = updatePaymentForMessage.request({
      messageId: messageId2,
      paymentId: paymentId2,
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
    });
    const thirdStateGeneration = paymentsReducer(
      secondStateGeneration,
      requestAction3
    );
    const messageId3 = "m3" as UIMessageId;
    const requestAction4 = updatePaymentForMessage.request({
      messageId: messageId3,
      paymentId: paymentId1,
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
    });
    const fourthStateGeneration = paymentsReducer(
      thirdStateGeneration,
      requestAction4
    );
    const requestAction5 = updatePaymentForMessage.request({
      messageId: messageId3,
      paymentId: paymentId2,
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
    });
    const fifthStateGeneration = paymentsReducer(
      fourthStateGeneration,
      requestAction5
    );
    const paymentId3 = "p3";
    const requestAction6 = updatePaymentForMessage.request({
      messageId: messageId3,
      paymentId: paymentId3,
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
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
        paymentId: paymentId1,
        serviceId
      },
      {
        messageId: messageId2,
        paymentId: paymentId2,
        serviceId
      },
      {
        messageId: messageId3,
        paymentId: paymentId2,
        serviceId
      },
      {
        messageId: messageId3,
        paymentId: paymentId3,
        serviceId
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
  it("Should have the paymentId for an addUserSelectedPaymentRptId action", () => {
    const paymentId = "p1";
    const setSelectedPaymentAction = addUserSelectedPaymentRptId(paymentId);
    const paymentsState = paymentsReducer(undefined, setSelectedPaymentAction);
    const userSelectedPayments = paymentsState.userSelectedPayments;
    const hasPaymentRptId = userSelectedPayments.has(paymentId);
    expect(hasPaymentRptId).toBe(true);
  });
  it("Should clear the paymentId for a updatePaymentForMessage.request action", () => {
    const paymentId = "p1";
    const setSelectedPaymentAction = addUserSelectedPaymentRptId(paymentId);
    const startingPaymentsState = paymentsReducer(
      undefined,
      setSelectedPaymentAction
    );
    const userSelectedPayments = startingPaymentsState.userSelectedPayments;
    const hasPaymentRptId = userSelectedPayments.has(paymentId);
    expect(hasPaymentRptId).toBe(true);
    const endingPaymentsState = paymentsReducer(
      startingPaymentsState,
      updatePaymentForMessage.request({
        messageId: "01HR9GY9GHGH5BQEJAKPWXEKV3" as UIMessageId,
        paymentId,
        serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
      })
    );
    const endingUserSelectedPayments = endingPaymentsState.userSelectedPayments;
    const endingHasPaymentRptId = endingUserSelectedPayments.has(paymentId);
    expect(endingHasPaymentRptId).toBe(false);
  });
  it("Should clear the paymentId for a reloadAllMessages action", () => {
    const paymentId = "p1";
    const addMessagePaymentToCheckAction =
      addUserSelectedPaymentRptId(paymentId);
    const startingPaymentsState = paymentsReducer(
      undefined,
      addMessagePaymentToCheckAction
    );
    const startingUserSelectedPayments =
      startingPaymentsState.userSelectedPayments;
    const startingHasPaymentToCheck =
      startingUserSelectedPayments.has(paymentId);
    expect(startingHasPaymentToCheck).toBe(true);
    const endingPaymentsState = paymentsReducer(
      startingPaymentsState,
      reloadAllMessages.request({
        pageSize: 12,
        filter: {},
        fromUserAction: false
      })
    );
    const endingUserSelectedPayments = endingPaymentsState.userSelectedPayments;
    const endingPaymentsToCheckSize = endingUserSelectedPayments.size;
    expect(endingPaymentsToCheckSize).toBe(0);
  });
});

describe("PN Payments selectors' tests", () => {
  it("shouldUpdatePaymentSelector should return true for an unmatching message Id", () => {
    const startingState = appReducer(undefined, {} as Action);
    const updatePaymentForMessageAction = updatePaymentForMessage.request({
      messageId: "m1" as UIMessageId,
      paymentId: "p1",
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
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
      paymentId: "p1",
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
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
      paymentId: "p1",
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
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
      paymentId: "p1",
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
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
      paymentId: "p1",
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
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
      paymentId: "p1",
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
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
      paymentData,
      serviceId: "01J5X5EM6RPT04PC8SFZREDDBP" as ServiceId
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
      details,
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
    });
    const state = appReducer(startingState, updatePaymentForMessageAction);
    const paymentStatus = paymentStatusForUISelector(
      state,
      "m1" as UIMessageId,
      "p1"
    );
    expect(paymentStatus).toStrictEqual(remoteError(details));
  });

  it("addUserSelectedPaymentRptId should contain added user selected payments and removed one later", () => {
    const paymentId1 = "01234567890012345678912345610";
    const paymentId2 = "01234567890012345678912345620";
    const paymentId3 = "01234567890012345678912345630";
    const addAction1 = addUserSelectedPaymentRptId(paymentId1);
    const addAction2 = addUserSelectedPaymentRptId(paymentId2);
    const addAction3 = addUserSelectedPaymentRptId(paymentId3);
    const initialAppState = appReducer(undefined, addAction1);
    const intermediateAppState = appReducer(initialAppState, addAction2);
    const finalAppState = appReducer(intermediateAppState, addAction3);
    const userSelectedPayments1 =
      finalAppState.entities.messages.payments.userSelectedPayments;
    expect(userSelectedPayments1.has(paymentId1)).toBe(true);
    expect(userSelectedPayments1.has(paymentId2)).toBe(true);
    expect(userSelectedPayments1.has(paymentId3)).toBe(true);
    const firstRemovedAppState = appReducer(
      finalAppState,
      updatePaymentForMessage.request({
        messageId: "" as UIMessageId,
        paymentId: paymentId1,
        serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
      })
    );
    const userSelectedPayments2 =
      firstRemovedAppState.entities.messages.payments.userSelectedPayments;
    expect(userSelectedPayments2.has(paymentId1)).toBe(false);
    expect(userSelectedPayments2.has(paymentId2)).toBe(true);
    expect(userSelectedPayments2.has(paymentId3)).toBe(true);
    const secondRemovedAppState = appReducer(
      firstRemovedAppState,
      updatePaymentForMessage.request({
        messageId: "" as UIMessageId,
        paymentId: paymentId2,
        serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
      })
    );
    const userSelectedPayments3 =
      secondRemovedAppState.entities.messages.payments.userSelectedPayments;
    expect(userSelectedPayments3.has(paymentId1)).toBe(false);
    expect(userSelectedPayments3.has(paymentId2)).toBe(false);
    expect(userSelectedPayments3.has(paymentId3)).toBe(true);
    const thirdRemovedAppState = appReducer(
      secondRemovedAppState,
      updatePaymentForMessage.request({
        messageId: "" as UIMessageId,
        paymentId: paymentId3,
        serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
      })
    );
    const userSelectedPayments4 =
      thirdRemovedAppState.entities.messages.payments.userSelectedPayments;
    expect(userSelectedPayments4.has(paymentId1)).toBe(false);
    expect(userSelectedPayments4.has(paymentId2)).toBe(false);
    expect(userSelectedPayments4.has(paymentId3)).toBe(false);
  });
});

describe("isUserSelectedPaymentSelector", () => {
  it("should return false when there is no match on an empty state", () => {
    const appState = appReducer(undefined, applicationChangeState("active"));
    const isUserSelectedPayment = isUserSelectedPaymentSelector(
      appState,
      "01234567890012345678912345610"
    );
    expect(isUserSelectedPayment).toBe(false);
  });
  it("should return false when there is no match on a non-empty state", () => {
    const initialState = appReducer(
      undefined,
      applicationChangeState("active")
    );
    const appState = appReducer(
      initialState,
      addUserSelectedPaymentRptId("01234567890012345678912345620")
    );
    const isUserSelectedPayment = isUserSelectedPaymentSelector(
      appState,
      "01234567890012345678912345610"
    );
    expect(isUserSelectedPayment).toBe(false);
  });
  it("should return true when there is a match", () => {
    const initialState = appReducer(
      undefined,
      applicationChangeState("active")
    );
    const intermediateState = appReducer(
      initialState,
      addUserSelectedPaymentRptId("01234567890012345678912345620")
    );
    const rptId = "01234567890012345678912345610";
    const appState = appReducer(
      intermediateState,
      addUserSelectedPaymentRptId(rptId)
    );
    const isUserSelectedPayment = isUserSelectedPaymentSelector(
      appState,
      rptId
    );
    expect(isUserSelectedPayment).toBe(true);
  });
});

describe("userSelectedPaymentRptIdSelector", () => {
  it("should return undefined when none is set", () => {
    const appState = appReducer(undefined, {} as Action);
    const messageDetails = {
      paymentData: {
        noticeNumber: "",
        payee: {
          fiscalCode: ""
        }
      }
    } as UIMessageDetails;
    const paymentToCheckRptId = userSelectedPaymentRptIdSelector(
      appState,
      messageDetails
    );
    expect(paymentToCheckRptId).toBeUndefined();
  });
  it("should return none when ids do not match", () => {
    const paymentData = {
      noticeNumber: "012345678912345678",
      payee: {
        fiscalCode: "01234567890"
      }
    } as PaymentData;
    const messageDetails = {
      paymentData: {
        noticeNumber: "012345678912345679",
        payee: {
          fiscalCode: "01234567890"
        }
      } as PaymentData
    } as UIMessageDetails;
    const rtpId = getRptIdStringFromPaymentData(paymentData);
    const appState = appReducer(undefined, addUserSelectedPaymentRptId(rtpId));
    const paymentToCheckRptId = userSelectedPaymentRptIdSelector(
      appState,
      messageDetails
    );
    expect(paymentToCheckRptId).toBeUndefined();
  });
  it("should return the selected payment when it matches", () => {
    const paymentData = {
      noticeNumber: "012345678912345678",
      payee: {
        fiscalCode: "01234567890"
      }
    } as PaymentData;
    const messageDetails = {
      paymentData
    } as UIMessageDetails;
    const rtpId = getRptIdStringFromPaymentData(paymentData);
    const appState = appReducer(undefined, addUserSelectedPaymentRptId(rtpId));
    const paymentToCheckRptId = userSelectedPaymentRptIdSelector(
      appState,
      messageDetails
    );
    expect(paymentToCheckRptId).toBe(rtpId);
  });
  it("should return the selected payment when it matches (and there are multiple user selected payments)", () => {
    const paymentData = {
      noticeNumber: "012345678912345678",
      payee: {
        fiscalCode: "01234567890"
      }
    } as PaymentData;
    const messageDetails = {
      paymentData
    } as UIMessageDetails;
    const appState = appReducer(
      undefined,
      addUserSelectedPaymentRptId(
        getRptIdStringFromPaymentData({
          noticeNumber: "012345678912345677",
          payee: {
            fiscalCode: "01234567890"
          }
        } as PaymentData)
      )
    );
    const appStateIntermediate = appReducer(
      appState,
      addUserSelectedPaymentRptId(
        getRptIdStringFromPaymentData({
          noticeNumber: "012345678912345676",
          payee: {
            fiscalCode: "01234567890"
          }
        } as PaymentData)
      )
    );
    const rtpId = getRptIdStringFromPaymentData(paymentData);
    const appStateFinal = appReducer(
      appStateIntermediate,
      addUserSelectedPaymentRptId(rtpId)
    );
    const paymentToCheckRptId = userSelectedPaymentRptIdSelector(
      appStateFinal,
      messageDetails
    );
    expect(paymentToCheckRptId).toBe(rtpId);
  });
});

describe("canNavigateToPaymentFromMessageSelector", () => {
  it("should return false if profile email is not validated and pagopa is not supported", () => {
    jest
      .spyOn(profile, "isProfileEmailValidatedSelector")
      .mockReturnValueOnce(false);
    jest
      .spyOn(versionInfo, "isPagoPaSupportedSelector")
      .mockReturnValueOnce(false);

    const appState = appReducer(undefined, applicationChangeState("active"));
    const canNavigateToPaymentFromMessage =
      canNavigateToPaymentFromMessageSelector(appState);
    expect(canNavigateToPaymentFromMessage).toBe(false);
  });
  it("should return false if profile email is not validated", () => {
    jest
      .spyOn(profile, "isProfileEmailValidatedSelector")
      .mockReturnValueOnce(false);
    jest
      .spyOn(versionInfo, "isPagoPaSupportedSelector")
      .mockReturnValueOnce(true);

    const appState = appReducer(undefined, applicationChangeState("active"));
    const canNavigateToPaymentFromMessage =
      canNavigateToPaymentFromMessageSelector(appState);
    expect(canNavigateToPaymentFromMessage).toBe(false);
  });
  it("should return false if pagopa is not supported", () => {
    jest
      .spyOn(profile, "isProfileEmailValidatedSelector")
      .mockReturnValueOnce(true);
    jest
      .spyOn(versionInfo, "isPagoPaSupportedSelector")
      .mockReturnValueOnce(false);

    const appState = appReducer(undefined, applicationChangeState("active"));
    const canNavigateToPaymentFromMessage =
      canNavigateToPaymentFromMessageSelector(appState);
    expect(canNavigateToPaymentFromMessage).toBe(false);
  });
  it("should return true if email si validated and pagopa is supported", () => {
    jest
      .spyOn(profile, "isProfileEmailValidatedSelector")
      .mockReturnValueOnce(true);
    jest
      .spyOn(versionInfo, "isPagoPaSupportedSelector")
      .mockReturnValueOnce(true);

    const appState = appReducer(undefined, applicationChangeState("active"));
    const canNavigateToPaymentFromMessage =
      canNavigateToPaymentFromMessageSelector(appState);
    expect(canNavigateToPaymentFromMessage).toBe(true);
  });
});

describe("paymentsButtonStateSelector", () => {
  it("should return hidden for a pot.none message details", () => {
    const appState = appReducer(undefined, applicationChangeState("active"));
    const messageId = "01HRSSD1R29DA2HJQHGYJP19T8" as UIMessageId;
    const paymentsButtonState = paymentsButtonStateSelector(
      appState,
      messageId
    );
    expect(paymentsButtonState).toBe("hidden");
  });
  it("should return hidden for a message without payment data", () => {
    const messageId = "01HRSSD1R29DA2HJQHGYJP19T8" as UIMessageId;
    const messageDetailsPot = pot.some({
      id: messageId
    } as UIMessageDetails);
    const appState = appReducer(undefined, applicationChangeState("active"));
    const finalState = {
      ...appState,
      entities: {
        ...appState.entities,
        messages: {
          ...appState.entities.messages,
          detailsById: {
            ...appState.entities.messages.detailsById,
            "01HRSSD1R29DA2HJQHGYJP19T8": messageDetailsPot
          }
        }
      }
    } as GlobalState;
    const paymentsButtonState = paymentsButtonStateSelector(
      finalState,
      messageId
    );
    expect(paymentsButtonState).toBe("hidden");
  });
  it("should return hidden for a payment with an error", () => {
    const messageId = "01HRSSD1R29DA2HJQHGYJP19T8" as UIMessageId;
    const paymentData = {
      noticeNumber: "012345678912345610",
      payee: {
        fiscalCode: "01234567890"
      }
    } as PaymentData;
    const messageDetailsPot = pot.some({
      id: messageId,
      paymentData
    } as UIMessageDetails);
    const appState = appReducer(undefined, applicationChangeState("active"));
    const finalState = {
      ...appState,
      entities: {
        ...appState.entities,
        messages: {
          ...appState.entities.messages,
          detailsById: {
            ...appState.entities.messages.detailsById,
            "01HRSSD1R29DA2HJQHGYJP19T8": messageDetailsPot
          },
          payments: {
            ...appState.entities.messages.payments,
            "01HRSSD1R29DA2HJQHGYJP19T8": {
              "01234567890012345678912345610": remoteError(
                Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO
              )
            }
          }
        }
      }
    } as GlobalState;
    const paymentsButtonState = paymentsButtonStateSelector(
      finalState,
      messageId
    );
    expect(paymentsButtonState).toBe("hidden");
  });
  it("should return loading for a payment with no data (no message entry in the payment section of redux)", () => {
    const messageId = "01HRSSD1R29DA2HJQHGYJP19T8" as UIMessageId;
    const paymentData = {
      noticeNumber: "012345678912345610",
      payee: {
        fiscalCode: "01234567890"
      }
    } as PaymentData;
    const messageDetailsPot = pot.some({
      id: messageId,
      paymentData
    } as UIMessageDetails);
    const appState = appReducer(undefined, applicationChangeState("active"));
    const finalState = {
      ...appState,
      entities: {
        ...appState.entities,
        messages: {
          ...appState.entities.messages,
          detailsById: {
            ...appState.entities.messages.detailsById,
            "01HRSSD1R29DA2HJQHGYJP19T8": messageDetailsPot
          }
        }
      }
    } as GlobalState;
    const paymentsButtonState = paymentsButtonStateSelector(
      finalState,
      messageId
    );
    expect(paymentsButtonState).toBe("loading");
  });
  it("should return loading for a payment with no data (no payment entry in the message's payment section of redux)", () => {
    const messageId = "01HRSSD1R29DA2HJQHGYJP19T8" as UIMessageId;
    const paymentData = {
      noticeNumber: "012345678912345610",
      payee: {
        fiscalCode: "01234567890"
      }
    } as PaymentData;
    const messageDetailsPot = pot.some({
      id: messageId,
      paymentData
    } as UIMessageDetails);
    const appState = appReducer(undefined, applicationChangeState("active"));
    const finalState = {
      ...appState,
      entities: {
        ...appState.entities,
        messages: {
          ...appState.entities.messages,
          detailsById: {
            ...appState.entities.messages.detailsById,
            "01HRSSD1R29DA2HJQHGYJP19T8": messageDetailsPot
          },
          payments: {
            ...appState.entities.messages.payments,
            "01HRSSD1R29DA2HJQHGYJP19T8": {}
          }
        }
      }
    } as GlobalState;
    const paymentsButtonState = paymentsButtonStateSelector(
      finalState,
      messageId
    );
    expect(paymentsButtonState).toBe("loading");
  });
  it("should return loading for a payment with remoteUndefined value", () => {
    const messageId = "01HRSSD1R29DA2HJQHGYJP19T8" as UIMessageId;
    const paymentData = {
      noticeNumber: "012345678912345610",
      payee: {
        fiscalCode: "01234567890"
      }
    } as PaymentData;
    const messageDetailsPot = pot.some({
      id: messageId,
      paymentData
    } as UIMessageDetails);
    const appState = appReducer(undefined, applicationChangeState("active"));
    const finalState = {
      ...appState,
      entities: {
        ...appState.entities,
        messages: {
          ...appState.entities.messages,
          detailsById: {
            ...appState.entities.messages.detailsById,
            "01HRSSD1R29DA2HJQHGYJP19T8": messageDetailsPot
          },
          payments: {
            ...appState.entities.messages.payments,
            "01HRSSD1R29DA2HJQHGYJP19T8": {
              "01234567890012345678912345610": remoteUndefined
            }
          }
        }
      }
    } as GlobalState;
    const paymentsButtonState = paymentsButtonStateSelector(
      finalState,
      messageId
    );
    expect(paymentsButtonState).toBe("loading");
  });
  it("should return loading for a loading payment", () => {
    const messageId = "01HRSSD1R29DA2HJQHGYJP19T8" as UIMessageId;
    const paymentData = {
      noticeNumber: "012345678912345610",
      payee: {
        fiscalCode: "01234567890"
      }
    } as PaymentData;
    const messageDetailsPot = pot.some({
      id: messageId,
      paymentData
    } as UIMessageDetails);
    const appState = appReducer(undefined, applicationChangeState("active"));
    const finalState = {
      ...appState,
      entities: {
        ...appState.entities,
        messages: {
          ...appState.entities.messages,
          detailsById: {
            ...appState.entities.messages.detailsById,
            "01HRSSD1R29DA2HJQHGYJP19T8": messageDetailsPot
          },
          payments: {
            ...appState.entities.messages.payments,
            "01HRSSD1R29DA2HJQHGYJP19T8": {
              "01234567890012345678912345610": remoteLoading
            }
          }
        }
      }
    } as GlobalState;
    const paymentsButtonState = paymentsButtonStateSelector(
      finalState,
      messageId
    );
    expect(paymentsButtonState).toBe("loading");
  });
  it("should return enabled for a payable payment", () => {
    const messageId = "01HRSSD1R29DA2HJQHGYJP19T8" as UIMessageId;
    const paymentData = {
      noticeNumber: "012345678912345610",
      payee: {
        fiscalCode: "01234567890"
      }
    } as PaymentData;
    const messageDetailsPot = pot.some({
      id: messageId,
      paymentData
    } as UIMessageDetails);
    const appState = appReducer(undefined, applicationChangeState("active"));
    const finalState = {
      ...appState,
      entities: {
        ...appState.entities,
        messages: {
          ...appState.entities.messages,
          detailsById: {
            ...appState.entities.messages.detailsById,
            "01HRSSD1R29DA2HJQHGYJP19T8": messageDetailsPot
          },
          payments: {
            ...appState.entities.messages.payments,
            "01HRSSD1R29DA2HJQHGYJP19T8": {
              "01234567890012345678912345610": remoteReady({})
            }
          }
        }
      }
    } as GlobalState;
    const paymentsButtonState = paymentsButtonStateSelector(
      finalState,
      messageId
    );
    expect(paymentsButtonState).toBe("enabled");
  });
});

describe("isPaymentsButtonVisibleSelector", () => {
  it("Should return false when the button is hidden", () => {
    const messageId = "01HRSSD1R29DA2HJQHGYJP19T8" as UIMessageId;
    const appState = appReducer(undefined, applicationChangeState("active"));
    const isPaymentButtonVisible = isPaymentsButtonVisibleSelector(
      appState,
      messageId
    );
    expect(isPaymentButtonVisible).toBe(false);
  });
  it("Should return true when the button is loading", () => {
    const messageId = "01HRSSD1R29DA2HJQHGYJP19T8" as UIMessageId;
    const appState = appReducer(undefined, applicationChangeState("active"));
    const finalState = {
      ...appState,
      entities: {
        ...appState.entities,
        messages: {
          ...appState.entities.messages,
          detailsById: {
            "01HRSSD1R29DA2HJQHGYJP19T8": pot.some({
              id: messageId,
              paymentData: {
                noticeNumber: "012345678912345610",
                payee: {
                  fiscalCode: "01234567890"
                }
              } as PaymentData
            } as UIMessageDetails)
          }
        }
      }
    } as GlobalState;
    const isPaymentButtonVisible = isPaymentsButtonVisibleSelector(
      finalState,
      messageId
    );
    expect(isPaymentButtonVisible).toBe(true);
  });
  it("Should return true when the button is enabled", () => {
    const messageId = "01HRSSD1R29DA2HJQHGYJP19T8" as UIMessageId;
    const appState = appReducer(undefined, applicationChangeState("active"));
    const finalState = {
      ...appState,
      entities: {
        ...appState.entities,
        messages: {
          ...appState.entities.messages,
          detailsById: {
            "01HRSSD1R29DA2HJQHGYJP19T8": pot.some({
              id: messageId,
              paymentData: {
                noticeNumber: "012345678912345610",
                payee: {
                  fiscalCode: "01234567890"
                }
              } as PaymentData
            } as UIMessageDetails)
          },
          payments: {
            ...appState.entities.messages.payments,
            "01HRSSD1R29DA2HJQHGYJP19T8": {
              "01234567890012345678912345610": remoteReady({})
            }
          }
        }
      }
    } as GlobalState;
    const isPaymentButtonVisible = isPaymentsButtonVisibleSelector(
      finalState,
      messageId
    );
    expect(isPaymentButtonVisible).toBe(true);
  });
});

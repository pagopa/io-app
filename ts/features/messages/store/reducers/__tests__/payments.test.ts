import * as pot from "@pagopa/ts-commons/lib/pot";
import { Detail_v2Enum } from "../../../../../../definitions/backend/PaymentProblemJson";
import { PaymentInfoResponse } from "../../../../../../definitions/backend/PaymentInfoResponse";
import {
  cancelQueuedPaymentUpdates,
  reloadAllMessages
} from "../../../../messages/store/actions";
import { Action } from "../../../../../store/actions/types";
import { appReducer } from "../../../../../store/reducers";
import { PaymentData, UIMessageDetails } from "../../../../messages/types";
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
  shouldRetrievePaymentDataSelector,
  isUserSelectedPaymentSelector,
  canNavigateToPaymentFromMessageSelector,
  paymentsButtonStateSelector,
  isPaymentsButtonVisibleSelector,
  testable,
  SinglePaymentState,
  MultiplePaymentState,
  paymentStatisticsForMessageUncachedSelector
} from "../payments";
import { getRptIdStringFromPaymentData } from "../../../utils";
import { applicationChangeState } from "../../../../../store/actions/application";
import * as versionInfo from "../../../../../common/versionInfo/store/reducers/versionInfo";
import * as profile from "../../../../settings/common/store/selectors";
import { GlobalState } from "../../../../../store/reducers/types";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import {
  toGenericError,
  toSpecificError,
  toTimeoutError
} from "../../../types/paymentErrors";

describe("Messages payments reducer's tests", () => {
  it("Should match initial state upon initialization", () => {
    const firstState = paymentsReducer(undefined, {} as Action);
    expect(firstState).toEqual(paymentsInitialState);
  });
  it("Should have undefined value for an undefined Message Id", () => {
    const requestAction = updatePaymentForMessage.request({
      messageId: "m1",
      paymentId: "p1",
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
    });
    const paymentsState = paymentsReducer(undefined, requestAction);
    const unknownMessageId = "m2";
    const messageState = paymentsState.paymentStatusListById[unknownMessageId];
    expect(messageState).toBeUndefined();
  });
  it("Should have undefined value for an unknown paymentId", () => {
    const messageId = "m1";
    const requestAction = updatePaymentForMessage.request({
      messageId,
      paymentId: "p1",
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
    });
    const paymentsState = paymentsReducer(undefined, requestAction);
    const messageState = paymentsState.paymentStatusListById[messageId];
    expect(messageState).toBeTruthy();
    const unknownPaymentId = "p2";
    const paymentState = messageState?.[unknownPaymentId];
    expect(paymentState).toBeUndefined();
  });
  it("Should have remoteLoading value for a updatePaymentForMessage.request", () => {
    const messageId = "m1";
    const paymentId = "p1";
    const requestAction = updatePaymentForMessage.request({
      messageId,
      paymentId,
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
    });
    const paymentsState = paymentsReducer(undefined, requestAction);
    const messageState = paymentsState.paymentStatusListById[messageId];
    expect(messageState).toBeTruthy();
    const paymentState = messageState?.[paymentId];
    expect(paymentState).toBe(remoteLoading);
  });
  it("Should have remoteReady value for a updatePaymentForMessage.success", () => {
    const messageId = "m1";
    const paymentId = "p1";
    const serviceId = "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId;
    const requestAction = updatePaymentForMessage.request({
      messageId,
      paymentId,
      serviceId
    });
    const paymentsState = paymentsReducer(undefined, requestAction);
    const paymentData = {
      amount: 100,
      rptId: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
    } as PaymentInfoResponse;
    const successAction = updatePaymentForMessage.success({
      messageId,
      paymentId,
      paymentData,
      serviceId
    });
    const updatedPaymentsState = paymentsReducer(paymentsState, successAction);
    const messageState = updatedPaymentsState.paymentStatusListById[messageId];
    expect(messageState).toBeTruthy();
    const paymentState = messageState?.[paymentId];
    const remoteSuccessPaymentData = remoteReady(paymentData);
    expect(paymentState).toStrictEqual(remoteSuccessPaymentData);
  });
  it("Should have remoteError value for a updatePaymentForMessage.failure", () => {
    const messageId = "m1";
    const paymentId = "p1";
    const serviceId = "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId;
    const requestAction = updatePaymentForMessage.request({
      messageId,
      paymentId,
      serviceId
    });
    const paymentsState = paymentsReducer(undefined, requestAction);
    const reason = toSpecificError(Detail_v2Enum.CANALE_BUSTA_ERRATA);
    const failureAction = updatePaymentForMessage.failure({
      messageId,
      paymentId,
      reason,
      serviceId
    });
    const updatedPaymentsState = paymentsReducer(paymentsState, failureAction);
    const messageState = updatedPaymentsState.paymentStatusListById[messageId];
    expect(messageState).toBeTruthy();
    const paymentState = messageState?.[paymentId];
    const remoteSuccessPaymentData = remoteError(reason);
    expect(paymentState).toStrictEqual(remoteSuccessPaymentData);
  });
  it("Should handle multiple payments for a single message", () => {
    const messageId = "m1";
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
      amount: 100,
      rptId: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
    } as PaymentInfoResponse;
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
    const thirdPaymentDetails = toSpecificError(
      Detail_v2Enum.CANALE_BUSTA_ERRATA
    );
    const failureAction = updatePaymentForMessage.failure({
      messageId,
      paymentId: paymentId3,
      reason: thirdPaymentDetails,
      serviceId
    });
    const finalStateGeneration = paymentsReducer(
      secondStateGeneration,
      failureAction
    );
    const messageState = finalStateGeneration.paymentStatusListById[messageId];
    expect(messageState).toBeTruthy();
    const firstPaymentState = messageState?.[paymentId1];
    expect(firstPaymentState).toBe(remoteLoading);
    const secondPaymentState = messageState?.[paymentId2];
    expect(secondPaymentState).toStrictEqual(remoteReady(secondPaymentData));
    const thirdPaymentState = messageState?.[paymentId3];
    expect(thirdPaymentState).toStrictEqual(remoteError(thirdPaymentDetails));
  });
  it("Should handle multiple payments for multiple messages", () => {
    const messageId1 = "m1";
    const paymentId1 = "p1";
    const serviceId = "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId;
    const requestAction = updatePaymentForMessage.request({
      messageId: messageId1,
      paymentId: paymentId1,
      serviceId
    });
    const firstStateGeneration = paymentsReducer(undefined, requestAction);
    const messageId2 = "m2";
    const successfulPaymentData = {
      amount: 100,
      rptId: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
    } as PaymentInfoResponse;
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
    const messageId3 = "m3";
    const failedPaymentDetails = toSpecificError(
      Detail_v2Enum.CANALE_BUSTA_ERRATA
    );
    const failureAction = updatePaymentForMessage.failure({
      messageId: messageId3,
      paymentId: paymentId1,
      reason: failedPaymentDetails,
      serviceId
    });
    const finalStateGeneration = paymentsReducer(
      secondStateGeneration,
      failureAction
    );
    const message1State =
      finalStateGeneration.paymentStatusListById[messageId1];
    expect(message1State).toBeTruthy();
    const firstPaymentState = message1State?.[paymentId1];
    expect(firstPaymentState).toBe(remoteLoading);
    const message2State =
      finalStateGeneration.paymentStatusListById[messageId2];
    expect(message2State).toBeTruthy();
    const secondPaymentState = message2State?.[paymentId1];
    expect(secondPaymentState).toStrictEqual(
      remoteReady(successfulPaymentData)
    );
    const message3State =
      finalStateGeneration.paymentStatusListById[messageId3];
    expect(message3State).toBeTruthy();
    const thirdPaymentState = message3State?.[paymentId1];
    expect(thirdPaymentState).toStrictEqual(remoteError(failedPaymentDetails));
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
        messageId: "01HR9GY9GHGH5BQEJAKPWXEKV3",
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
  it("Should remove undefined, loading, generic and timeout errors when receiving a cancelQueuedPaymentUpdates action", () => {
    const inputState = {
      paymentStatusListById: {
        "01JWX4BBJBQ1SY34F68X92QFW4": {
          "01234567890012345678912345610": undefined,
          "01234567890012345678912345620": remoteUndefined,
          "01234567890012345678912345630": remoteLoading,
          "01234567890012345678912345640": remoteReady(
            {} as PaymentInfoResponse
          ),
          "01234567890012345678912345650": remoteError(
            toGenericError("An error")
          ),
          "01234567890012345678912345660": remoteError(
            toSpecificError(Detail_v2Enum.GENERIC_ERROR)
          ),
          "01234567890012345678912345670": remoteError(toTimeoutError())
        },
        "01JWX4BMJ7S372FHQEKCZKGN90": {
          "01234567890012345678912345610": undefined,
          "01234567890012345678912345620": remoteUndefined,
          "01234567890012345678912345630": remoteLoading,
          "01234567890012345678912345640": remoteReady(
            {} as PaymentInfoResponse
          ),
          "01234567890012345678912345650": remoteError(
            toGenericError("An error")
          ),
          "01234567890012345678912345660": remoteError(
            toSpecificError(Detail_v2Enum.GENERIC_ERROR)
          ),
          "01234567890012345678912345670": remoteError(toTimeoutError())
        }
      },
      userSelectedPayments: new Set<string>([
        "01234567890012345678912345610",
        "01234567890012345678912345640",
        "01234567890012345678912345650"
      ])
    } as MultiplePaymentState;
    const output = paymentsReducer(
      inputState,
      cancelQueuedPaymentUpdates({
        messageId: "01JWX4BMJ7S372FHQEKCZKGN90"
      })
    );
    expect(output).toEqual({
      paymentStatusListById: {
        "01JWX4BBJBQ1SY34F68X92QFW4": {
          "01234567890012345678912345610": undefined,
          "01234567890012345678912345620": remoteUndefined,
          "01234567890012345678912345630": remoteLoading,
          "01234567890012345678912345640": remoteReady(
            {} as PaymentInfoResponse
          ),
          "01234567890012345678912345650": remoteError(
            toGenericError("An error")
          ),
          "01234567890012345678912345660": remoteError(
            toSpecificError(Detail_v2Enum.GENERIC_ERROR)
          ),
          "01234567890012345678912345670": remoteError(toTimeoutError())
        },
        "01JWX4BMJ7S372FHQEKCZKGN90": {
          "01234567890012345678912345610": undefined,
          "01234567890012345678912345620": remoteUndefined,
          "01234567890012345678912345630": undefined,
          "01234567890012345678912345640": remoteReady(
            {} as PaymentInfoResponse
          ),
          "01234567890012345678912345650": undefined,
          "01234567890012345678912345660": remoteError(
            toSpecificError(Detail_v2Enum.GENERIC_ERROR)
          ),
          "01234567890012345678912345670": undefined
        }
      },
      userSelectedPayments: new Set<string>([
        "01234567890012345678912345610",
        "01234567890012345678912345640",
        "01234567890012345678912345650"
      ])
    });
  });
});

describe("PN Payments selectors' tests", () => {
  it("shouldRetrievePaymentDataSelector should return true for an unmatching message Id", () => {
    const startingState = appReducer(undefined, {} as Action);
    const updatePaymentForMessageAction = updatePaymentForMessage.request({
      messageId: "m1",
      paymentId: "p1",
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
    });
    const state = appReducer(startingState, updatePaymentForMessageAction);
    const shouldUpdatePayment = shouldRetrievePaymentDataSelector(
      state,
      "m2",
      "p1"
    );
    expect(shouldUpdatePayment).toBeTruthy();
  });
  it("shouldRetrievePaymentDataSelector should return true for a matching message Id with an unmatching payment Id", () => {
    const startingState = appReducer(undefined, {} as Action);
    const updatePaymentForMessageAction = updatePaymentForMessage.request({
      messageId: "m1",
      paymentId: "p1",
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
    });
    const state = appReducer(startingState, updatePaymentForMessageAction);
    const shouldUpdatePayment = shouldRetrievePaymentDataSelector(
      state,
      "m1",
      "p2"
    );
    expect(shouldUpdatePayment).toBeTruthy();
  });
  it("shouldRetrievePaymentDataSelector should return false for a matching <message Id, payment Id> pair", () => {
    const startingState = appReducer(undefined, {} as Action);
    const updatePaymentForMessageAction = updatePaymentForMessage.request({
      messageId: "m1",
      paymentId: "p1",
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
    });
    const state = appReducer(startingState, updatePaymentForMessageAction);
    const shouldUpdatePayment = shouldRetrievePaymentDataSelector(
      state,
      "m1",
      "p1"
    );
    expect(shouldUpdatePayment).toBeFalsy();
  });
  it("paymentStatusForUISelector should return remoteUndefined for an unmatching message Id", () => {
    const startingState = appReducer(undefined, {} as Action);
    const updatePaymentForMessageAction = updatePaymentForMessage.request({
      messageId: "m1",
      paymentId: "p1",
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
    });
    const state = appReducer(startingState, updatePaymentForMessageAction);
    const paymentStatus = paymentStatusForUISelector(state, "m2", "p1");
    expect(paymentStatus).toBe(remoteUndefined);
  });
  it("paymentStatusForUISelector should return remoteUndefined for a matching message Id with an unmatching payment Id", () => {
    const startingState = appReducer(undefined, {} as Action);
    const updatePaymentForMessageAction = updatePaymentForMessage.request({
      messageId: "m1",
      paymentId: "p1",
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
    });
    const state = appReducer(startingState, updatePaymentForMessageAction);
    const paymentStatus = paymentStatusForUISelector(state, "m1", "p2");
    expect(paymentStatus).toBe(remoteUndefined);
  });
  it("paymentStatusForUISelector should return remoteUndefined for a matching <message Id, payment Id> that is loading", () => {
    const startingState = appReducer(undefined, {} as Action);
    const updatePaymentForMessageAction = updatePaymentForMessage.request({
      messageId: "m1",
      paymentId: "p1",
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
    });
    const state = appReducer(startingState, updatePaymentForMessageAction);
    const paymentStatusOnStore =
      state.entities.messages.payments.paymentStatusListById.m1?.p1;
    expect(paymentStatusOnStore).toBe(remoteLoading);
    const paymentStatus = paymentStatusForUISelector(state, "m1", "p1");
    expect(paymentStatus).toBe(remoteUndefined);
  });
  it("paymentStatusForUISelector should return remoteReady for a matching <message Id, payment Id> that is payable", () => {
    const paymentData = {} as PaymentInfoResponse;
    const startingState = appReducer(undefined, {} as Action);
    const updatePaymentForMessageAction = updatePaymentForMessage.success({
      messageId: "m1",
      paymentId: "p1",
      paymentData,
      serviceId: "01J5X5EM6RPT04PC8SFZREDDBP" as ServiceId
    });
    const state = appReducer(startingState, updatePaymentForMessageAction);
    const paymentStatus = paymentStatusForUISelector(state, "m1", "p1");
    expect(paymentStatus).toStrictEqual(remoteReady(paymentData));
  });
  it("paymentStatusForUISelector should return remoteError for a matching <message Id, payment Id> that is not payable anymore", () => {
    const reason = toSpecificError(Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO);
    const startingState = appReducer(undefined, {} as Action);
    const updatePaymentForMessageAction = updatePaymentForMessage.failure({
      messageId: "m1",
      paymentId: "p1",
      reason,
      serviceId: "01J5X2R3J2MQKABRPC61ZSJDZ3" as ServiceId
    });
    const state = appReducer(startingState, updatePaymentForMessageAction);
    const paymentStatus = paymentStatusForUISelector(state, "m1", "p1");
    expect(paymentStatus).toStrictEqual(remoteError(reason));
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
        messageId: "",
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
        messageId: "",
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
        messageId: "",
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
    const messageId = "01HRSSD1R29DA2HJQHGYJP19T8";
    const paymentsButtonState = paymentsButtonStateSelector(
      appState,
      messageId
    );
    expect(paymentsButtonState).toBe("hidden");
  });
  it("should return hidden for a message without payment data", () => {
    const messageId = "01HRSSD1R29DA2HJQHGYJP19T8";
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
    const messageId = "01HRSSD1R29DA2HJQHGYJP19T8";
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
            paymentStatusListById: {
              ...appState.entities.messages.payments.paymentStatusListById,
              "01HRSSD1R29DA2HJQHGYJP19T8": {
                "01234567890012345678912345610": remoteError(
                  Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO
                )
              } as unknown as MultiplePaymentState["paymentStatusListById"]
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
    const messageId = "01HRSSD1R29DA2HJQHGYJP19T8";
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
    const messageId = "01HRSSD1R29DA2HJQHGYJP19T8";
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
            paymentStatusListById: {
              ...appState.entities.messages.payments.paymentStatusListById,
              "01HRSSD1R29DA2HJQHGYJP19T8": {}
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
  it("should return loading for a payment with remoteUndefined value", () => {
    const messageId = "01HRSSD1R29DA2HJQHGYJP19T8";
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
            paymentStatusListById: {
              ...appState.entities.messages.payments.paymentStatusListById,
              "01HRSSD1R29DA2HJQHGYJP19T8": {
                "01234567890012345678912345610": remoteUndefined
              }
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
    const messageId = "01HRSSD1R29DA2HJQHGYJP19T8";
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
            paymentStatusListById: {
              ...appState.entities.messages.payments.paymentStatusListById,
              "01HRSSD1R29DA2HJQHGYJP19T8": {
                "01234567890012345678912345610": remoteLoading
              }
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
    const messageId = "01HRSSD1R29DA2HJQHGYJP19T8";
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
            paymentStatusListById: {
              ...appState.entities.messages.payments.paymentStatusListById,
              "01HRSSD1R29DA2HJQHGYJP19T8": {
                "01234567890012345678912345610": remoteReady({})
              } as unknown as MultiplePaymentState["paymentStatusListById"]
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
    const messageId = "01HRSSD1R29DA2HJQHGYJP19T8";
    const appState = appReducer(undefined, applicationChangeState("active"));
    const isPaymentButtonVisible = isPaymentsButtonVisibleSelector(
      appState,
      messageId
    );
    expect(isPaymentButtonVisible).toBe(false);
  });
  it("Should return true when the button is loading", () => {
    const messageId = "01HRSSD1R29DA2HJQHGYJP19T8";
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
    const messageId = "01HRSSD1R29DA2HJQHGYJP19T8";
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
            paymentStatusListById: {
              ...appState.entities.messages.payments.paymentStatusListById,
              "01HRSSD1R29DA2HJQHGYJP19T8": {
                "01234567890012345678912345610": remoteReady({})
              } as unknown as MultiplePaymentState["paymentStatusListById"]
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

describe("paymentStateSelector", () => {
  const message1Id = "01HR9GY9GHGH5BQEJAKPWXEKV3";
  const message2Id = "01HR9GY9GHGH5BQEJAKPWXEKV4";
  const paymentId1 = "01234567890012345678912345610";
  const paymentId2 = "01234567890012345678912345620";
  it("should return remoteUndefined when there is no match on messageId", () => {
    const state = {
      entities: {
        messages: {
          payments: {
            paymentStatusListById: {
              [message2Id]: {
                [paymentId1]: remoteLoading
              }
            }
          }
        }
      }
    } as unknown as GlobalState;
    const output = testable!.paymentStateSelector(
      state,
      message1Id,
      paymentId1
    );
    expect(output).toBe(remoteUndefined);
  });
  it("should return remoteUndefined when there is no match on paymentId", () => {
    const state = {
      entities: {
        messages: {
          payments: {
            paymentStatusListById: {
              [message1Id]: {
                [paymentId2]: remoteLoading
              }
            }
          }
        }
      }
    } as unknown as GlobalState;
    const output = testable!.paymentStateSelector(
      state,
      message1Id,
      paymentId1
    );
    expect(output).toBe(remoteUndefined);
  });
  [
    remoteUndefined,
    remoteLoading,
    remoteReady({} as PaymentInfoResponse),
    remoteError(toTimeoutError())
  ].forEach(paymentStatus => {
    it(`should return expected status (${JSON.stringify(
      paymentStatus
    )})`, () => {
      const state = {
        entities: {
          messages: {
            payments: {
              paymentStatusListById: {
                [message1Id]: {
                  [paymentId1]: remoteReady({} as PaymentInfoResponse)
                },
                [message2Id]: {
                  [paymentId2]: paymentStatus
                }
              }
            }
          }
        }
      } as unknown as GlobalState;
      const output = testable!.paymentStateSelector(
        state,
        message2Id,
        paymentId2
      );
      expect(output).toEqual(paymentStatus);
    });
  });

  describe("purgePaymentsWithIncompleteData", () => {
    it("should remove loading, generic error and timeout errors from input state", () => {
      const inputState: SinglePaymentState = {
        "01234567890012345678912345610": undefined,
        "01234567890012345678912345620": remoteUndefined,
        "01234567890012345678912345630": remoteLoading,
        "01234567890012345678912345640": remoteReady({} as PaymentInfoResponse),
        "01234567890012345678912345650": remoteError(
          toGenericError("An error")
        ),
        "01234567890012345678912345660": remoteError(
          toSpecificError(Detail_v2Enum.GENERIC_ERROR)
        ),
        "01234567890012345678912345670": remoteError(toTimeoutError())
      };
      const output = testable!.purgePaymentsWithIncompleteData(inputState);
      expect(output).toEqual({
        "01234567890012345678912345610": undefined,
        "01234567890012345678912345620": remoteUndefined,
        "01234567890012345678912345630": undefined,
        "01234567890012345678912345640": remoteReady({} as PaymentInfoResponse),
        "01234567890012345678912345650": undefined,
        "01234567890012345678912345660": remoteError(
          toSpecificError(Detail_v2Enum.GENERIC_ERROR)
        ),
        "01234567890012345678912345670": undefined
      });
    });
  });
});

describe("initialPaymentStatistics", () => {
  it("should match expected value", () => {
    const output = testable!.initialPaymentStatistics(5);
    expect(output).toEqual({
      paymentCount: 5,
      unpaidCount: 0,
      paidCount: 0,
      errorCount: 0,
      expiredCount: 0,
      revokedCount: 0,
      ongoingCount: 0
    });
  });
});

const errorCases = [
  [toGenericError("An error"), { errorCount: 1 }],
  [toTimeoutError(), { errorCount: 1 }],
  [toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO), { paidCount: 1 }],
  [toSpecificError(Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO), { paidCount: 1 }],
  [toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO), { revokedCount: 1 }],
  [toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_SCADUTO), { expiredCount: 1 }],
  [toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_IN_CORSO), { ongoingCount: 1 }],
  [toSpecificError(Detail_v2Enum.PPT_PAGAMENTO_IN_CORSO), { ongoingCount: 1 }],
  [
    toSpecificError(Detail_v2Enum.CANALE_CARRELLO_DUPLICATO_UNKNOWN),
    { errorCount: 1 }
  ],
  [toSpecificError(Detail_v2Enum.GENERIC_ERROR), { errorCount: 1 }]
] as const;
const paymentStatistics = testable!.initialPaymentStatistics(1);

describe("paymentErrorToPaymentStatistics", () => {
  errorCases.forEach(([error, expectedStatistics]) => {
    it(`should return expected statistics for error: ${JSON.stringify(
      error
    )}`, () => {
      const output = testable!.paymentErrorToPaymentStatistics(
        paymentStatistics,
        error
      );
      expect(output).toEqual({
        ...paymentStatistics,
        ...expectedStatistics
      });
    });
  });
});

describe("paymentStatisticsForMessageUncachedSelector", () => {
  const messageId = "01HRSSD1R29DA2HJQHGYJP19T8";
  const paymentId1 = "01234567890012345678912345610";
  const paymentId2 = "01234567890012345678912345611";
  const payment1Data = { amount: 100 } as PaymentInfoResponse;
  it("should return undefined for unmatching message Id", () => {
    const state = {
      entities: {
        messages: {
          payments: {
            paymentStatusListById: {
              [messageId]: {
                [paymentId1]: remoteReady(payment1Data)
              }
            }
          }
        }
      }
    } as unknown as GlobalState;
    const messageId2 = "01HRSSD1R29DA2HJQHGYJP19T9";
    const output = paymentStatisticsForMessageUncachedSelector(
      state,
      messageId2,
      1,
      [paymentId1]
    );
    expect(output).toBeUndefined();
  });
  [remoteUndefined, remoteLoading].forEach(remoteStatus => {
    it(`should return undefined for one not-ready payment (${remoteStatus.kind})`, () => {
      const state = {
        entities: {
          messages: {
            payments: {
              paymentStatusListById: {
                [messageId]: {
                  [paymentId1]: remoteStatus
                }
              }
            }
          }
        }
      } as unknown as GlobalState;
      const output = paymentStatisticsForMessageUncachedSelector(
        state,
        messageId,
        1,
        [paymentId1]
      );
      expect(output).toBeUndefined();
    });
  });
  const successAndErrorCases = [
    [remoteReady(payment1Data), { unpaidCount: 1 }] as const,
    ...errorCases.map(
      ([input, expectedStatistics]) =>
        [remoteError(input), expectedStatistics] as const
    )
  ] as const;
  successAndErrorCases.forEach(([input, expectedStatistics]) => {
    it(`should return expected statistics for one ready payment (${JSON.stringify(
      input
    )})`, () => {
      const state = {
        entities: {
          messages: {
            payments: {
              paymentStatusListById: {
                [messageId]: {
                  [paymentId1]: input
                }
              }
            }
          }
        }
      } as unknown as GlobalState;
      const output = paymentStatisticsForMessageUncachedSelector(
        state,
        messageId,
        1,
        [paymentId1]
      );
      expect(output).toEqual({ ...paymentStatistics, ...expectedStatistics });
    });
  });
  [remoteUndefined, remoteLoading].forEach(remoteStatus => {
    it(`should return undefined for two payments, one ready and one not (${remoteStatus.kind})`, () => {
      const state = {
        entities: {
          messages: {
            payments: {
              paymentStatusListById: {
                [messageId]: {
                  [paymentId1]: remoteReady({ amount: 200 }),
                  [paymentId2]: remoteStatus
                }
              }
            }
          }
        }
      } as unknown as GlobalState;
      const output = paymentStatisticsForMessageUncachedSelector(
        state,
        messageId,
        2,
        [paymentId1, paymentId2]
      );
      expect(output).toBeUndefined();
    });
  });
  successAndErrorCases.forEach(([input, expectedStatistics]) => {
    it(`should return expected statistics for two payments: one ready and one (${JSON.stringify(
      input
    )})`, () => {
      const state = {
        entities: {
          messages: {
            payments: {
              paymentStatusListById: {
                [messageId]: {
                  [paymentId1]: remoteReady({ amount: 200 }),
                  [paymentId2]: input
                }
              }
            }
          }
        }
      } as unknown as GlobalState;
      const output = paymentStatisticsForMessageUncachedSelector(
        state,
        messageId,
        2,
        [paymentId1, paymentId2]
      );
      const expectedOutput = {
        ...paymentStatistics,
        ...expectedStatistics,
        paymentCount: 2
      };
      expect(output).toEqual({
        ...expectedOutput,
        unpaidCount: expectedOutput.unpaidCount + 1
      });
    });
  });
  const paymentId3 = "01234567890012345678912345612";
  const paymentId4 = "01234567890012345678912345613";
  const paymentId5 = "01234567890012345678912345614";
  const paymentId6 = "01234567890012345678912345615";
  const paymentId7 = "01234567890012345678912345616";
  const paymentId8 = "01234567890012345678912345617";
  const paymentId9 = "01234567890012345678912345618";
  const paymentId10 = "01234567890012345678912345619";
  const paymentId11 = "01234567890012345678912345620";
  const paymentId12 = "01234567890012345678912345621";
  [remoteUndefined, remoteLoading].forEach(remoteStatus => {
    it(`should return undefined for 12 payments, 11 ready and one not (${remoteStatus.kind})`, () => {
      const state = {
        entities: {
          messages: {
            payments: {
              paymentStatusListById: {
                [messageId]: {
                  [paymentId1]: remoteReady({ amount: 200 }),
                  [paymentId2]: remoteError(toGenericError("An error")),
                  [paymentId3]: remoteError(toTimeoutError()),
                  [paymentId4]: remoteError(
                    toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO)
                  ),
                  [paymentId5]: remoteError(
                    toSpecificError(Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO)
                  ),
                  [paymentId6]: remoteError(
                    toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO)
                  ),
                  [paymentId7]: remoteError(
                    toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_SCADUTO)
                  ),
                  [paymentId8]: remoteError(
                    toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_IN_CORSO)
                  ),
                  [paymentId9]: remoteError(
                    toSpecificError(Detail_v2Enum.PPT_PAGAMENTO_IN_CORSO)
                  ),
                  [paymentId10]: remoteError(
                    toSpecificError(
                      Detail_v2Enum.CANALE_CARRELLO_DUPLICATO_UNKNOWN
                    )
                  ),
                  [paymentId11]: remoteError(
                    toSpecificError(Detail_v2Enum.GENERIC_ERROR)
                  ),
                  [paymentId12]: remoteStatus
                }
              }
            }
          }
        }
      } as unknown as GlobalState;
      const output = paymentStatisticsForMessageUncachedSelector(
        state,
        messageId,
        12,
        [
          paymentId1,
          paymentId2,
          paymentId3,
          paymentId4,
          paymentId5,
          paymentId6,
          paymentId7,
          paymentId8,
          paymentId9,
          paymentId10,
          paymentId11,
          paymentId12
        ]
      );
      expect(output).toBeUndefined();
    });
  });
  successAndErrorCases.forEach(([input, expectedStatistics]) => {
    it(`should return expected statistics for 12 payments: 1 ready, 10 in error and one (${JSON.stringify(
      input
    )})`, () => {
      const state = {
        entities: {
          messages: {
            payments: {
              paymentStatusListById: {
                [messageId]: {
                  [paymentId1]: remoteReady({ amount: 200 }),
                  [paymentId2]: remoteError(toGenericError("An error")),
                  [paymentId3]: remoteError(toTimeoutError()),
                  [paymentId4]: remoteError(
                    toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO)
                  ),
                  [paymentId5]: remoteError(
                    toSpecificError(Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO)
                  ),
                  [paymentId6]: remoteError(
                    toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO)
                  ),
                  [paymentId7]: remoteError(
                    toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_SCADUTO)
                  ),
                  [paymentId8]: remoteError(
                    toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_IN_CORSO)
                  ),
                  [paymentId9]: remoteError(
                    toSpecificError(Detail_v2Enum.PPT_PAGAMENTO_IN_CORSO)
                  ),
                  [paymentId10]: remoteError(
                    toSpecificError(
                      Detail_v2Enum.CANALE_CARRELLO_DUPLICATO_UNKNOWN
                    )
                  ),
                  [paymentId11]: remoteError(
                    toSpecificError(Detail_v2Enum.GENERIC_ERROR)
                  ),
                  [paymentId12]: input
                }
              }
            }
          }
        }
      } as unknown as GlobalState;
      const output = paymentStatisticsForMessageUncachedSelector(
        state,
        messageId,
        12,
        [
          paymentId1,
          paymentId2,
          paymentId3,
          paymentId4,
          paymentId5,
          paymentId6,
          paymentId7,
          paymentId8,
          paymentId9,
          paymentId10,
          paymentId11,
          paymentId12
        ]
      );
      expect(output).toEqual({
        paymentCount: 12,
        unpaidCount:
          1 +
          ("unpaidCount" in expectedStatistics
            ? expectedStatistics.unpaidCount
            : 0),
        paidCount:
          2 +
          ("paidCount" in expectedStatistics
            ? expectedStatistics.paidCount
            : 0),
        errorCount:
          4 +
          ("errorCount" in expectedStatistics
            ? expectedStatistics.errorCount
            : 0),
        expiredCount:
          1 +
          ("expiredCount" in expectedStatistics
            ? expectedStatistics.expiredCount
            : 0),
        revokedCount:
          1 +
          ("revokedCount" in expectedStatistics
            ? expectedStatistics.revokedCount
            : 0),
        ongoingCount:
          2 +
          ("ongoingCount" in expectedStatistics
            ? expectedStatistics.ongoingCount
            : 0)
      });
    });
  });
});

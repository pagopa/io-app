import * as E from "fp-ts/lib/Either";
import { ActionType } from "typesafe-actions";
import { testSaga } from "redux-saga-test-plan";
import { Channel, channel } from "redux-saga";
import { call, fork, take } from "redux-saga/effects";
import {
  handlePaymentUpdateRequests,
  testable
} from "../handlePaymentUpdateRequests";
import {
  cancelQueuedPaymentUpdates,
  toGenericError,
  toSpecificError,
  toTimeoutError,
  updatePaymentForMessage,
  UpdatePaymentForMessageSuccess
} from "../../store/actions";
import { UIMessageId } from "../../types";
import { Detail_v2Enum } from "../../../../../definitions/backend/PaymentProblemJson";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { isPagoPATestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import * as MIXPANEL from "../../../../mixpanel";

describe("handlePaymentUpdateRequests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  const messageId = "01JWXM7Q90CX4S57P855JZ63PC" as UIMessageId;
  const paymentId = "0123456789012345678901234567890";
  const serviceId = "01JWXM8C2NJT15SC930ZKGCRDB" as ServiceId;
  describe("handlePaymentUpdateRequests", () => {
    it("should follow proper flow", () => {
      const mockGetPaymentDataRequestFactory = jest.fn();
      const mockActionChannel = channel();
      testSaga(handlePaymentUpdateRequests, mockGetPaymentDataRequestFactory)
        .next()
        .actionChannel(updatePaymentForMessage.request)
        .next(mockActionChannel)
        .all([
          fork(
            testable!.paymentUpdateRequestWorker as any,
            mockActionChannel,
            mockGetPaymentDataRequestFactory
          ),
          fork(
            testable!.paymentUpdateRequestWorker as any,
            mockActionChannel,
            mockGetPaymentDataRequestFactory
          ),
          fork(
            testable!.paymentUpdateRequestWorker as any,
            mockActionChannel,
            mockGetPaymentDataRequestFactory
          ),
          fork(
            testable!.paymentUpdateRequestWorker as any,
            mockActionChannel,
            mockGetPaymentDataRequestFactory
          ),
          fork(
            testable!.paymentUpdateRequestWorker as any,
            mockActionChannel,
            mockGetPaymentDataRequestFactory
          )
        ])
        .next()
        .take(cancelQueuedPaymentUpdates)
        .next()
        .flush(mockActionChannel)
        .next()
        .take(cancelQueuedPaymentUpdates);
    });
  });

  describe("paymentUpdateRequestWorker", () => {
    it("should follow proper flow when using paymentDataRequest API (isTest true)", () => {
      const mockChannel = channel() as Channel<
        ActionType<typeof updatePaymentForMessage.request>
      >;
      const mockGetPaymentDataRequestFactory = jest.fn();
      const paymentActionRequest = updatePaymentForMessage.request({
        messageId,
        paymentId,
        serviceId
      });

      testSaga(
        testable!.paymentUpdateRequestWorker,
        mockChannel,
        mockGetPaymentDataRequestFactory
      )
        .next()
        .take(mockChannel)
        .next(paymentActionRequest)
        .select(isPagoPATestEnabledSelector)
        .next(true)
        .race({
          hasVerifiedPayment: call(
            testable!.updatePaymentInfo,
            paymentActionRequest,
            true,
            mockGetPaymentDataRequestFactory
          ),
          wasCancelled: take(cancelQueuedPaymentUpdates)
        })
        .next(cancelQueuedPaymentUpdates({ messageId }))
        .take(mockChannel);
    });
    it("should properly handle a thrown Error", () => {
      const mockChannel = channel() as Channel<
        ActionType<typeof updatePaymentForMessage.request>
      >;
      const mockGetPaymentDataRequestFactory = jest.fn();
      const paymentActionRequest = updatePaymentForMessage.request({
        messageId,
        paymentId,
        serviceId
      });
      const error = Error(Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO);
      const paymentError = toSpecificError(
        Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO
      );

      testSaga(
        testable!.paymentUpdateRequestWorker,
        mockChannel,
        mockGetPaymentDataRequestFactory
      )
        .next()
        .take(mockChannel)
        .next(paymentActionRequest)
        .select(isPagoPATestEnabledSelector)
        .next(true)
        .race({
          hasVerifiedPayment: call(
            testable!.updatePaymentInfo,
            paymentActionRequest,
            true,
            mockGetPaymentDataRequestFactory
          ),
          wasCancelled: take(cancelQueuedPaymentUpdates)
        })
        .throw(error)
        .call(testable!.unknownErrorToPaymentError, error)
        .next(paymentError)
        .call(testable!.trackPaymentErrorIfNeeded, paymentError)
        .next()
        .put(
          updatePaymentForMessage.failure({
            messageId,
            paymentId,
            reason: paymentError,
            serviceId
          })
        )
        .next()
        .take(mockChannel);
    });
  });

  describe("updatePaymentInfo", () => {
    it("should return an error if API result is a left", () => {
      const paymentActionRequest = updatePaymentForMessage.request({
        messageId,
        paymentId,
        serviceId
      });
      const mockGetPaymentDataRequestFactory = jest.fn();
      const output = tryCatchErrorOrUndefined(() => {
        testSaga(
          testable!.updatePaymentInfo,
          paymentActionRequest,
          true,
          mockGetPaymentDataRequestFactory
        )
          .next()
          .call(
            withRefreshApiCall,
            mockGetPaymentDataRequestFactory({ rptId: paymentId, test: true }),
            paymentActionRequest
          )
          .next(E.left([]));
      });
      expect(output).toEqual(Error());
    });
    [404, 409, 502, 503].forEach(statusCode =>
      it(`should return an error if API result is ${statusCode}`, () => {
        const paymentActionRequest = updatePaymentForMessage.request({
          messageId,
          paymentId,
          serviceId
        });
        const mockGetPaymentDataRequestFactory = jest.fn();
        const output = tryCatchErrorOrUndefined(() => {
          testSaga(
            testable!.updatePaymentInfo,
            paymentActionRequest,
            true,
            mockGetPaymentDataRequestFactory
          )
            .next()
            .call(
              withRefreshApiCall,
              mockGetPaymentDataRequestFactory({
                rptId: paymentId,
                test: true
              }),
              paymentActionRequest
            )
            .next(
              E.right({
                status: statusCode,
                value: {
                  faultCodeDetail: Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO
                }
              })
            );
        });
        expect(output).toEqual(Error(Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO));
      })
    );
    it(`should return an error if API result is 500`, () => {
      const paymentActionRequest = updatePaymentForMessage.request({
        messageId,
        paymentId,
        serviceId
      });
      const mockGetPaymentDataRequestFactory = jest.fn();
      const output = tryCatchErrorOrUndefined(() => {
        testSaga(
          testable!.updatePaymentInfo,
          paymentActionRequest,
          true,
          mockGetPaymentDataRequestFactory
        )
          .next()
          .call(
            withRefreshApiCall,
            mockGetPaymentDataRequestFactory({
              rptId: paymentId,
              test: true
            }),
            paymentActionRequest
          )
          .next(
            E.right({
              status: 500,
              value: {
                status: 500,
                title: "titl",
                detail: "detai",
                type: "typ",
                instance: "instanc"
              }
            })
          );
      });
      expect(output).toEqual(
        Error("HTTP Status 500 (500) (titl) (detai) (typ) (instanc)")
      );
    });
    it(`should do nothing if API result is 401`, () => {
      const paymentActionRequest = updatePaymentForMessage.request({
        messageId,
        paymentId,
        serviceId
      });
      const mockGetPaymentDataRequestFactory = jest.fn();
      const output = tryCatchErrorOrUndefined(() => {
        testSaga(
          testable!.updatePaymentInfo,
          paymentActionRequest,
          true,
          mockGetPaymentDataRequestFactory
        )
          .next()
          .call(
            withRefreshApiCall,
            mockGetPaymentDataRequestFactory({
              rptId: paymentId,
              test: true
            }),
            paymentActionRequest
          )
          .next(
            E.right({
              status: 401
            })
          );
      });
      expect(output).toBeUndefined();
    });
    it(`should follow proper flow`, () => {
      const paymentActionRequest = updatePaymentForMessage.request({
        messageId,
        paymentId,
        serviceId
      });
      const mockGetPaymentDataRequestFactory = jest.fn();

      testSaga(
        testable!.updatePaymentInfo,
        paymentActionRequest,
        true,
        mockGetPaymentDataRequestFactory
      )
        .next()
        .call(
          withRefreshApiCall,
          mockGetPaymentDataRequestFactory({
            rptId: paymentId,
            test: true
          }),
          paymentActionRequest
        )
        .next(
          E.right({
            status: 200,
            value: {
              amount: 100
            }
          })
        )
        .put(
          updatePaymentForMessage.success({
            messageId,
            paymentId,
            paymentData: {
              amount: 100
            },
            serviceId
          } as UpdatePaymentForMessageSuccess)
        )
        .next()
        .isDone();
    });
  });

  describe("unknownErrorToPaymentError", () => {
    it("should return a timeout error for max-retries Error", () => {
      const output = testable!.unknownErrorToPaymentError(Error("max-retries"));
      expect(output).toEqual(toTimeoutError());
    });
    it("should return a timeout error for aborted Error", () => {
      const output = testable!.unknownErrorToPaymentError(Error("aborted"));
      expect(output).toEqual(toTimeoutError());
    });
    it("should return a timeout error for max-retries string", () => {
      const output = testable!.unknownErrorToPaymentError("max-retries");
      expect(output).toEqual(toTimeoutError());
    });
    it("should return a timeout error for aborted string", () => {
      const output = testable!.unknownErrorToPaymentError("aborted");
      expect(output).toEqual(toTimeoutError());
    });
    it("should return a specifc error for Detail_v2Enum code Error", () => {
      const output = testable!.unknownErrorToPaymentError(
        Error(Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO)
      );
      expect(output).toEqual(
        toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO)
      );
    });
    it("should return a specifc error for Detail_v2Enum code", () => {
      const output = testable!.unknownErrorToPaymentError(
        Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO
      );
      expect(output).toEqual(
        toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO)
      );
    });
    it("should return a generic error for a generic error", () => {
      const output = testable!.unknownErrorToPaymentError(
        Error("Some generic error")
      );
      expect(output).toEqual(toGenericError("Some generic error"));
    });
  });

  describe("unknownErrorToString", () => {
    it("should return 'Unknown error with no data' for undefined value", () => {
      const output = testable!.unknownErrorToString(undefined);
      expect(output).toEqual("Unknown error with no data");
    });
    it("should return 'Error with unknown data' for non-string, non Error value", () => {
      const output = testable!.unknownErrorToString({ reason: "test" });
      expect(output).toEqual("Error with unknown data");
    });
    it("should return input string for string value", () => {
      const output = testable!.unknownErrorToString("This is a test");
      expect(output).toEqual("This is a test");
    });
    it("should return Error's message for Error value", () => {
      const output = testable!.unknownErrorToString(Error("This is a test"));
      expect(output).toEqual("This is a test");
    });
  });

  describe("trackPaymentErrorIfNeeded", () => {
    it("should track an anlytics event for a generic error", () => {
      const spyOnMixpanelTrack = jest
        .spyOn(MIXPANEL, "mixpanelTrack")
        .mockImplementation((_event, _properties) => undefined);

      testable!.trackPaymentErrorIfNeeded(toGenericError("An error"));

      expect(spyOnMixpanelTrack.mock.calls.length).toBe(1);
      expect(spyOnMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(spyOnMixpanelTrack.mock.calls[0][0]).toBe(
        "MESSAGE_PAYMENT_FAILURE"
      );
      expect(spyOnMixpanelTrack.mock.calls[0][1]).toEqual({
        event_category: "KO",
        event_type: undefined,
        flow: undefined,
        reason: "An error"
      });
    });
    it("should not track an anlytics event for a specific error", () => {
      const spyOnMixpanelTrack = jest
        .spyOn(MIXPANEL, "mixpanelTrack")
        .mockImplementation((_event, _properties) => undefined);

      testable!.trackPaymentErrorIfNeeded(
        toSpecificError(Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO)
      );

      expect(spyOnMixpanelTrack.mock.calls.length).toBe(0);
    });
    it("should not track an anlytics event for a timeout error", () => {
      const spyOnMixpanelTrack = jest
        .spyOn(MIXPANEL, "mixpanelTrack")
        .mockImplementation((_event, _properties) => undefined);

      testable!.trackPaymentErrorIfNeeded(toTimeoutError());

      expect(spyOnMixpanelTrack.mock.calls.length).toBe(0);
    });
  });
});

const tryCatchErrorOrUndefined = (callback: () => void) => {
  try {
    callback();
  } catch (e) {
    return e;
  }
  return undefined;
};

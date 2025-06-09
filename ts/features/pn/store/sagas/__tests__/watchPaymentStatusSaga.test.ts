import * as pot from "@pagopa/ts-commons/lib/pot";
import { call, take } from "redux-saga/effects";
import { expectSaga, testSaga } from "redux-saga-test-plan";
import { Detail_v2Enum } from "../../../../../../definitions/backend/PaymentProblemJson";
import {
  testable,
  watchPaymentStatusForMixpanelTracking
} from "../watchPaymentStatusSaga";
import {
  cancelPNPaymentStatusTracking,
  startPNPaymentStatusTracking
} from "../../actions";
import { UIMessageId } from "../../../../messages/types";
import {
  toSpecificError,
  updatePaymentForMessage
} from "../../../../messages/store/actions";
import { ServiceId } from "../../../../../../definitions/services/ServiceId";
import { PaymentInfoResponse } from "../../../../../../definitions/backend/PaymentInfoResponse";
import * as analytics from "../../../analytics";

describe("watchPaymentStatusSaga", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const messageId = "01JWZGTJWM2SVHKW4WRPA0KQNQ" as UIMessageId;
  const paymentId = "0123456789012345678901234567890";
  const serviceId = "01JWZHBN0APWE62V06M6G5W373" as ServiceId;

  const reducer = () => ({
    entities: {
      messages: {
        thirdPartyById: {
          [messageId]: pot.some({
            third_party_message: {
              details: {
                subject: "",
                iun: "",
                notificationStatusHistory: [],
                recipients: [
                  {
                    denomination: "Hello, World! 123",
                    recipientType: "",
                    payment: {
                      noticeCode: "12345678901234567890",
                      creditorTaxId: "01234567890"
                    },
                    taxId: "12345678901"
                  },
                  {
                    denomination: "Hello, World! 123",
                    recipientType: "",
                    payment: {
                      noticeCode: "12345678901234567891",
                      creditorTaxId: "01234567890"
                    },
                    taxId: "12345678901"
                  },
                  {
                    denomination: "Hello, World! 123",
                    recipientType: "",
                    payment: {
                      noticeCode: "12345678901234567892",
                      creditorTaxId: "01234567890"
                    },
                    taxId: "12345678901"
                  },
                  {
                    denomination: "Hello, World! 123",
                    recipientType: "",
                    payment: {
                      noticeCode: "12345678901234567893",
                      creditorTaxId: "01234567890"
                    },
                    taxId: "12345678901"
                  },
                  {
                    denomination: "Hello, World! 123",
                    recipientType: "",
                    payment: {
                      noticeCode: "12345678901234567894",
                      creditorTaxId: "01234567890"
                    },
                    taxId: "12345678901"
                  },
                  {
                    denomination: "Hello, World! 123",
                    recipientType: "",
                    payment: {
                      noticeCode: "12345678901234567895",
                      creditorTaxId: "01234567890"
                    },
                    taxId: "12345678901"
                  }
                ]
              }
            }
          })
        }
      }
    },
    profile: pot.some({
      fiscal_code: "12345678901"
    })
  });

  describe("watchPaymentStatusForMixpanelTracking", () => {
    it("should follow proper flow", () => {
      testSaga(
        watchPaymentStatusForMixpanelTracking,
        startPNPaymentStatusTracking(messageId)
      )
        .next()
        .race({
          polling: call(
            testable!.generateSENDMessagePaymentStatistics,
            messageId,
            0,
            []
          ),
          cancelAction: take(cancelPNPaymentStatusTracking)
        })
        .next(cancelPNPaymentStatusTracking)
        .isDone();
    });
  });

  describe("trackPaymentUpdates", () => {
    const paymentId2 = "0123456789012345678901234567891";
    const paymentId3 = "0123456789012345678901234567892";
    const paymentId4 = "0123456789012345678901234567893";
    const paymentId5 = "0123456789012345678901234567894";
    const requestAction1 = updatePaymentForMessage.request({
      messageId,
      paymentId,
      serviceId
    });
    const requestAction2 = updatePaymentForMessage.request({
      messageId,
      paymentId: paymentId2,
      serviceId
    });
    const requestAction3 = updatePaymentForMessage.request({
      messageId,
      paymentId: paymentId3,
      serviceId
    });
    const requestAction4 = updatePaymentForMessage.request({
      messageId,
      paymentId: paymentId4,
      serviceId
    });
    const requestAction5 = updatePaymentForMessage.request({
      messageId,
      paymentId: paymentId5,
      serviceId
    });

    const successAction1 = updatePaymentForMessage.success({
      messageId,
      paymentId,
      serviceId,
      paymentData: {
        amount: 100
      } as PaymentInfoResponse
    });
    const failureAction2 = updatePaymentForMessage.failure({
      messageId,
      paymentId: paymentId2,
      serviceId,
      reason: toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO)
    });
    const failureAction3 = updatePaymentForMessage.failure({
      messageId,
      paymentId: paymentId3,
      serviceId,
      reason: toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_SCADUTO)
    });
    const failureAction4 = updatePaymentForMessage.failure({
      messageId,
      paymentId: paymentId4,
      serviceId,
      reason: toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO)
    });
    const failureAction5 = updatePaymentForMessage.failure({
      messageId,
      paymentId: paymentId5,
      serviceId,
      reason: toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_IN_CORSO)
    });
    it("should call 'trackPNPaymentStatus' with proper parameters, reporting data from only the first five payments (the ones shown by the UI)", async () => {
      const spyOnMockedTrackPNPaymentStatus = jest
        .spyOn(analytics, "trackPNPaymentStatus")
        .mockImplementation();

      await expectSaga(
        testable!.generateSENDMessagePaymentStatistics,
        messageId,
        0,
        []
      )
        .withReducer(reducer)
        .dispatch(requestAction1)
        .dispatch(requestAction2)
        .dispatch(requestAction3)
        .dispatch(requestAction4)
        .dispatch(requestAction5)
        .dispatch(
          updatePaymentForMessage.request({
            messageId,
            paymentId: "0123456789012345678901234567895",
            serviceId
          })
        )
        .dispatch(successAction1)
        .dispatch(failureAction2)
        .dispatch(failureAction3)
        .dispatch(failureAction4)
        .dispatch(failureAction5)
        .dispatch(
          updatePaymentForMessage.failure({
            messageId,
            paymentId: "0123456789012345678901234567895",
            serviceId,
            reason: toSpecificError(Detail_v2Enum.CANALE_BUSTA_ERRATA)
          })
        )
        .run();
      expect(spyOnMockedTrackPNPaymentStatus.mock.calls.length).toBe(1);
      expect(spyOnMockedTrackPNPaymentStatus.mock.calls[0].length).toBe(1);
      expect(spyOnMockedTrackPNPaymentStatus.mock.calls[0][0]).toEqual({
        paymentCount: 6,
        unpaidCount: 1,
        paidCount: 1,
        errorCount: 0,
        expiredCount: 1,
        revokedCount: 1,
        ongoingCount: 1
      });
    });
    it("should keep listening for payments when not all of them have finished processing", async () => {
      const spyOnMockedTrackPNPaymentStatus = jest
        .spyOn(analytics, "trackPNPaymentStatus")
        .mockImplementation();

      await expectSaga(
        testable!.generateSENDMessagePaymentStatistics,
        messageId,
        0,
        []
      )
        .withReducer(reducer)
        .dispatch(requestAction1)
        .dispatch(requestAction2)
        .dispatch(requestAction3)
        .dispatch(requestAction4)
        .dispatch(requestAction5)
        .dispatch(
          updatePaymentForMessage.request({
            messageId,
            paymentId: "0123456789012345678901234567895",
            serviceId
          })
        )
        .dispatch(successAction1)
        .dispatch(failureAction2)
        .dispatch(failureAction3)
        .dispatch(failureAction4)
        .dispatch(
          updatePaymentForMessage.failure({
            messageId,
            paymentId: "0123456789012345678901234567895",
            serviceId,
            reason: toSpecificError(Detail_v2Enum.CANALE_BUSTA_ERRATA)
          })
        )
        .run(250);
      expect(spyOnMockedTrackPNPaymentStatus.mock.calls.length).toBe(0);
    });
  });
});

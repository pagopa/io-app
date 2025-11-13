import { call, take } from "redux-saga/effects";
import { testSaga } from "redux-saga-test-plan";
import {
  testable,
  watchPaymentStatusForMixpanelTracking
} from "../watchPaymentStatusSaga";
import {
  cancelPNPaymentStatusTracking,
  startPNPaymentStatusTracking
} from "../../actions";
import { profileFiscalCodeSelector } from "../../../../settings/common/store/selectors";
import { paymentsFromSendMessage } from "../../../utils";
import { sendMessageFromIdSelector } from "../../reducers";
import { getRptIdStringFromPayment } from "../../../utils/rptId";
import { NotificationPaymentInfo } from "../../../../../../definitions/pn/NotificationPaymentInfo";
import { paymentStatisticsForMessageUncachedSelector } from "../../../../messages/store/reducers/payments";
import { trackPNPaymentStatus } from "../../../analytics";
import {
  SendOpeningSource,
  SendUserType
} from "../../../../pushNotifications/analytics";

describe("watchPaymentStatusSaga", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const messageId = "01JWZGTJWM2SVHKW4WRPA0KQNQ";
  const paymentId1 = "0123456789012345678901234567890";
  const paymentId2 = "0123456789012345678901234567891";
  const paymentId3 = "0123456789012345678901234567892";
  const paymentId4 = "0123456789012345678901234567893";
  const paymentId5 = "0123456789012345678901234567894";
  const paymentId6 = "0123456789012345678901234567895";
  const taxId = "01234567890";

  const pnMessage = {
    subject: "",
    iun: "",
    notificationStatusHistory: [],
    recipients: [
      {
        denomination: "Hello, World! 123",
        recipientType: "",
        payment: {
          noticeCode: paymentId1.slice(11, 31),
          creditorTaxId: paymentId1.slice(0, 11)
        },
        taxId
      },
      {
        denomination: "Hello, World! 123",
        recipientType: "",
        payment: {
          noticeCode: paymentId2.slice(11, 31),
          creditorTaxId: paymentId2.slice(0, 11)
        },
        taxId
      },
      {
        denomination: "Hello, World! 123",
        recipientType: "",
        payment: {
          noticeCode: paymentId3.slice(11, 31),
          creditorTaxId: paymentId3.slice(0, 11)
        },
        taxId
      },
      {
        denomination: "Hello, World! 123",
        recipientType: "",
        payment: {
          noticeCode: paymentId4.slice(11, 31),
          creditorTaxId: paymentId4.slice(0, 11)
        },
        taxId
      },
      {
        denomination: "Hello, World! 123",
        recipientType: "",
        payment: {
          noticeCode: paymentId5.slice(11, 31),
          creditorTaxId: paymentId5.slice(0, 11)
        },
        taxId
      },
      {
        denomination: "Hello, World! 123",
        recipientType: "",
        payment: {
          noticeCode: paymentId6.slice(11, 31),
          creditorTaxId: paymentId6.slice(0, 11)
        },
        taxId
      }
    ]
  };

  const sendOpeningSources: ReadonlyArray<SendOpeningSource> = [
    "aar",
    "message",
    "not_set"
  ];
  const sendUserTypes: ReadonlyArray<SendUserType> = [
    "mandatory",
    "not_set",
    "recipient"
  ];

  describe("watchPaymentStatusForMixpanelTracking", () => {
    sendOpeningSources.forEach(sendOpeningSource => {
      sendUserTypes.forEach(sendUserType => {
        it(`should follow proper flow (opening source: ${sendOpeningSource}, user type ${sendUserType})`, () => {
          testSaga(
            watchPaymentStatusForMixpanelTracking,
            startPNPaymentStatusTracking({
              openingSource: sendOpeningSource,
              userType: sendUserType,
              messageId
            })
          )
            .next()
            .select(profileFiscalCodeSelector)
            .next(taxId)
            .select(sendMessageFromIdSelector, messageId)
            .next(pnMessage)
            .call(
              paymentsFromSendMessage,
              sendOpeningSource === "message" ? taxId : undefined,
              pnMessage
            )
            .next(pnMessage.recipients.map(rec => rec.payment))
            .race({
              polling: call(
                testable!.generateSENDMessagePaymentStatistics,
                sendOpeningSource,
                sendUserType,
                messageId,
                6,
                pnMessage.recipients
                  .slice(0, 5)
                  .map(rec =>
                    getRptIdStringFromPayment(
                      rec.payment as NotificationPaymentInfo
                    )
                  )
              ),
              cancelAction: take(cancelPNPaymentStatusTracking)
            })
            .next(cancelPNPaymentStatusTracking)
            .isDone();
        });
      });
    });
  });

  describe("generateSENDMessagePaymentStatistics", () => {
    sendOpeningSources.forEach(sendOpeningSource => {
      sendUserTypes.forEach(sendUserType => {
        it(`should do nothing if payment count is zero (opening source: ${sendOpeningSource}, user type ${sendUserType})`, () => {
          testSaga(
            testable!.generateSENDMessagePaymentStatistics,
            sendOpeningSource,
            sendUserType,
            messageId,
            0,
            [paymentId1]
          )
            .next()
            .isDone();
        });
        it(`should do nothing if payment Ids is an empty array (opening source: ${sendOpeningSource}, user type ${sendUserType})`, () => {
          testSaga(
            testable!.generateSENDMessagePaymentStatistics,
            sendOpeningSource,
            sendUserType,
            messageId,
            1,
            []
          )
            .next()
            .isDone();
        });
        it(`should keep waiting if payments are not ready (opening source: ${sendOpeningSource}, user type ${sendUserType})`, () => {
          const paymentIds = [
            paymentId1,
            paymentId2,
            paymentId3,
            paymentId4,
            paymentId5
          ];
          testSaga(
            testable!.generateSENDMessagePaymentStatistics,
            sendOpeningSource,
            sendUserType,
            messageId,
            6,
            paymentIds
          )
            .next()
            .select(
              paymentStatisticsForMessageUncachedSelector,
              messageId,
              6,
              paymentIds
            )
            .next(undefined)
            .delay(500)
            .next()
            .select(
              paymentStatisticsForMessageUncachedSelector,
              messageId,
              6,
              paymentIds
            );
        });
        it(`should call tracking method when payments are ready (opening source: ${sendOpeningSource}, user type ${sendUserType})`, () => {
          const paymentIds = [
            paymentId1,
            paymentId2,
            paymentId3,
            paymentId4,
            paymentId5
          ];
          const paymentStatistics = {
            paymentCount: 6,
            unpaidCount: 1,
            paidCount: 1,
            errorCount: 1,
            expiredCount: 1,
            revokedCount: 1,
            ongoingCount: 0
          };
          testSaga(
            testable!.generateSENDMessagePaymentStatistics,
            sendOpeningSource,
            sendUserType,
            messageId,
            6,
            paymentIds
          )
            .next()
            .select(
              paymentStatisticsForMessageUncachedSelector,
              messageId,
              6,
              paymentIds
            )
            .next(paymentStatistics)
            .call(
              trackPNPaymentStatus,
              paymentStatistics,
              sendOpeningSource,
              sendUserType
            )
            .next()
            .isDone();
        });
      });
    });
  });
});

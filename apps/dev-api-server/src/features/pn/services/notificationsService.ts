import { fakerIT as faker } from "@faker-js/faker";
import { PaymentFaultV2Enum } from "@io-app/api-types/generated/definitions/communication/PaymentFaultV2";
import { PreconditionContent } from "@io-app/api-types/generated/definitions/pn/PreconditionContent";
import { ThirdPartyMessage } from "@io-app/api-types/generated/definitions/pn/ThirdPartyMessage";
import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { isSome } from "fp-ts/lib/Option";

import { getProblemJson } from "../../../payloads/error";
import { PaymentsDatabase } from "../../../persistence/payments";
import { isProcessedPayment } from "../../../types/PaymentStatus";
import { ExpressFailure } from "../../../utils/expressDTO";
import { NotificationRepository } from "../repositories/notificationRepository";
import {
  Notification,
  NotificationHistory,
  NotificationRecipient
} from "./../models/Notification";
import { checkAndVerifyExistingMandate } from "./mandateService";

export const notificationFromIUN = (
  iun: string
): Either<ExpressFailure, { iun: string; notification: Notification }> => {
  const notification = NotificationRepository.getNotification(iun);
  if (notification == null) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "Notification not found",
        `Requested notification does not exist (iun: ${iun})`
      )
    });
  }
  return right({ iun, notification });
};

export const preconditionsForNotification = (
  notification: Notification
): PreconditionContent => {
  // This is not the real behaviour but we use the parameter to simulate the precondition's content switch
  if (notification.acknowledged) {
    return {
      title: "Questo messaggio contiene una comunicazione a valore legale",
      markdown: `Premendo “Continua”, la notifica risulterà legalmente recapitata a te, a meno che tu non abbia ricevuto la raccomandata cartacea da più di 10 giorni.\n\n__Mittente__\n${notification.senderDenomination}\n\n__Codice IUN__\n${notification.iun}`
    };
  }

  const referenceDate = faker.date.soon({ days: 5 });
  return {
    title: "Questo messaggio contiene una comunicazione a valore legale",
    markdown: `Premendo “Continua”, la notifica risulterà legalmente recapitata a te.\n**Se apri il messaggio entro il ${referenceDate
      .toISOString()
      .slice(0, 10)} alle ${referenceDate
      .toISOString()
      .slice(
        11,
        19
      )}**, eviterai di ricevere la raccomandata, i cui eventuali costi saranno calcolati in fase di pagamento.\n\n**Mittente**\n${
      notification.senderDenomination
    }\n\n**Codice IUN**\n${notification.iun}`
  };
};

export const thirdPartyMessageFromIUNTaxIdAndMandateId = (
  iun: string,
  taxId: string,
  mandateId?: string
): Either<ExpressFailure, ThirdPartyMessage> => {
  const notificationEither = notificationFromIUN(iun);
  if (isLeft(notificationEither)) {
    return notificationEither;
  }

  const { notification } = notificationEither.right;
  if (notification.recipientFiscalCode !== taxId) {
    const mandateEither = checkAndVerifyExistingMandate(
      notification.iun,
      mandateId,
      taxId
    );
    if (isLeft(mandateEither)) {
      return mandateEither;
    }
  }
  const thirdPartyMessageEither = notificationToThirdPartyMessage(notification);
  if (isLeft(thirdPartyMessageEither)) {
    return left({
      httpStatusCode: 500,
      reason: getProblemJson(
        500,
        "Conversion to ThirdPartyMessage failed",
        `Unable to convert retrieved Notification to the ThirdPartyMessage data structure (${thirdPartyMessageEither.left})`
      )
    });
  }
  return thirdPartyMessageEither;
};

const notificationToThirdPartyMessage = (
  notification: Notification
): Either<string, ThirdPartyMessage> => {
  const thirdPartyMessage = {
    attachments: attachmentsFromNotification(notification),
    details: {
      abstract: notification.abstract,
      completedPayments: completedPaymentsFromNotification(notification),
      iun: notification.iun,
      isCancelled: notification.cancelled,
      notificationStatusHistory: notificationStatusHistoryFromHistory(
        notification.history
      ),
      recipients: recipientsFromRecipients(notification.recipients),
      senderDenomination: notification.senderDenomination,
      subject: notification.subject
    }
  };
  const thirdPartyMessageEither = ThirdPartyMessage.decode(thirdPartyMessage);
  if (isLeft(thirdPartyMessageEither)) {
    return left(readableReportSimplified(thirdPartyMessageEither.left));
  }
  return right(thirdPartyMessageEither.right);
};

const completedPaymentsFromNotification = (notification: Notification) =>
  notification.cancelled
    ? notification.recipients
        ?.filter(recipient => {
          if (recipient.paymentId == null) {
            return false;
          }
          const paymentStatusOption = PaymentsDatabase.getPaymentStatus(
            recipient.paymentId
          );
          if (isSome(paymentStatusOption)) {
            const paymentStatus = paymentStatusOption.value;
            if (isProcessedPayment(paymentStatus)) {
              return (
                paymentStatus.status.detail_v2 ===
                  PaymentFaultV2Enum.PAA_PAGAMENTO_DUPLICATO ||
                paymentStatus.status.detail_v2 ===
                  PaymentFaultV2Enum.PPT_PAGAMENTO_DUPLICATO
              );
            }
          }
          return false;
        })
        .map(recipient => recipient.paymentId)
    : undefined;

const attachmentsFromNotification = (notification: Notification) =>
  notification.attachments?.map((attachment, index) => {
    const url =
      attachment.category === "DOCUMENT"
        ? `/delivery/notifications/received/${notification.iun}/attachments/documents/${attachment.index}`
        : `/delivery/notifications/received/${notification.iun}/attachments/payment/${attachment.category}?attachmentIdx=${attachment.index}`;
    return {
      id: `${index}`,
      url,
      content_type: attachment.contentType,
      name: attachment.filename,
      category: attachment.category
    };
  });

const notificationStatusHistoryFromHistory = (
  history: ReadonlyArray<NotificationHistory>
) => [...history];

const recipientsFromRecipients = (
  recipients: ReadonlyArray<NotificationRecipient> | undefined
) =>
  recipients?.map(recipient => ({
    denomination: recipient.denomination,
    payment:
      recipient.paymentId != null
        ? {
            creditorTaxId: recipient.paymentId.substring(0, 11),
            noticeCode: recipient.paymentId.substring(11)
          }
        : undefined,
    recipientType: recipient.type,
    taxId: recipient.recipientFiscalCode
  }));

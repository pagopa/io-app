import * as t from "io-ts";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { MvlAttachment } from "../../../mvl/types/mvlData";

export const NotificationPaymentInfoR = t.interface({
  noticeCode: t.string,
  creditorTaxId: t.string
});
export const NotificationPaymentInfoO = t.partial({});

export const NotificationPaymentInfo = t.intersection(
  [NotificationPaymentInfoR, NotificationPaymentInfoO],
  "NotificationPaymentInfo"
);

export const NotificationRecipientR = t.interface({
  denomination: t.string,
  taxId: t.string
});

export const NotificationRecipientO = t.partial({
  payment: NotificationPaymentInfo
});

export const NotificationRecipient = t.intersection(
  [NotificationRecipientR, NotificationRecipientO],
  "NotificationRecipient"
);

export const FullReceivedNotificationR = t.interface({
  subject: t.string,
  iun: t.string,
  recipients: t.array(NotificationRecipient)
});

export const FullReceivedNotificationO = t.partial({
  abstract: t.string,
  senderDenomination: t.string
});

export const FullReceivedNotification = t.intersection(
  [FullReceivedNotificationR, FullReceivedNotificationO],
  "FullReceivedNotification"
);

export type FullReceivedNotification = t.TypeOf<
  typeof FullReceivedNotification
>;

export type PNMessage = FullReceivedNotification &
  Readonly<{
    serviceId: ServiceId;
    attachments?: ReadonlyArray<MvlAttachment>;
  }>;

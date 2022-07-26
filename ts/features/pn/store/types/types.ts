import * as t from "io-ts";
import { enumType } from "italia-ts-commons/lib/types";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { MvlAttachment } from "../../../mvl/types/mvlData";
import { UTCISODateFromString } from "../../utils/dates";

export enum NotificationStatusEnum {
  "IN_VALIDATION" = "IN_VALIDATION",
  "ACCEPTED" = "ACCEPTED",
  "DELIVERING" = "DELIVERING",
  "DELIVERED" = "DELIVERED",
  "VIEWED" = "VIEWED",
  "EFFECTIVE_DATE" = "EFFECTIVE_DATE",
  "PAID" = "PAID",
  "UNREACHABLE" = "UNREACHABLE",
  "REFUSED" = "REFUSED",
  "CANCELLED" = "CANCELLED"
}

export type NotificationStatus = t.TypeOf<typeof NotificationStatus>;
export const NotificationStatus = enumType<NotificationStatusEnum>(
  NotificationStatusEnum,
  "NotificationStatus"
);

export type TimelineElementId = t.TypeOf<typeof TimelineElementId>;
export const TimelineElementId = t.string;

const NotificationStatusHistoryElementR = t.interface({
  activeFrom: UTCISODateFromString,

  relatedTimelineElements: t.readonlyArray(
    TimelineElementId,
    "array of TimelineElementId"
  ),

  status: NotificationStatus
});
const NotificationStatusHistoryElementO = t.partial({});

export const NotificationStatusHistoryElement = t.intersection(
  [NotificationStatusHistoryElementR, NotificationStatusHistoryElementO],
  "NotificationStatusHistoryElement"
);
export type NotificationStatusHistoryElement = t.TypeOf<
  typeof NotificationStatusHistoryElement
>;

export type NotificationStatusHistory = t.TypeOf<
  typeof NotificationStatusHistory
>;
export const NotificationStatusHistory = t.readonlyArray(
  NotificationStatusHistoryElement,
  "array of NotificationStatusHistoryElement"
);

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
  recipients: t.array(NotificationRecipient),
  notificationStatusHistory: NotificationStatusHistory
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

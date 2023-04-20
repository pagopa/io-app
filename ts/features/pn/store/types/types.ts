import * as t from "io-ts";
import { IsoDateFromString } from "@pagopa/ts-commons/lib/dates";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { UIAttachment } from "../../../../store/reducers/entities/messages/types";

export type NotificationStatus = t.TypeOf<typeof NotificationStatus>;
export const NotificationStatus = t.string;

export type TimelineElementId = t.TypeOf<typeof TimelineElementId>;
export const TimelineElementId = t.string;

const NotificationStatusHistoryElementR = t.interface({
  activeFrom: IsoDateFromString,

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
    attachments?: ReadonlyArray<UIAttachment>;
  }>;

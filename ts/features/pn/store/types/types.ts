import * as t from "io-ts";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import {
  Attachment,
  PaymentData
} from "../../../../store/reducers/entities/messages/types";

export const FullReceivedNotificationR = t.interface({
  subject: t.string,
  iun: t.string
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
    attachments?: ReadonlyArray<Attachment>;
    paymentData?: PaymentData;
  }>;

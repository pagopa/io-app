import * as t from "io-ts";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import {
  Attachment,
  PaymentData
} from "../../../../store/reducers/entities/messages/types";

export const FullReceivedNotification = t.interface({
  subject: t.string,
  abstract: t.string,
  iun: t.string,
  senderDenomination: t.string
});

export type FullReceivedNotification = t.TypeOf<
  typeof FullReceivedNotification
>;

export type PNMessage = FullReceivedNotification &
  Readonly<{
    serviceId: ServiceId;
    attachments?: ReadonlyArray<Attachment>;
    paymentData?: PaymentData;
  }>;

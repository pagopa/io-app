import { Document } from "./Document";

export interface Notification {
  abstract: string;
  acknowledged: boolean;
  attachments: ReadonlyArray<Document> | undefined;
  cancelled: boolean;
  history: ReadonlyArray<NotificationHistory>;
  iun: string;
  recipientFiscalCode: string;
  recipients: ReadonlyArray<NotificationRecipient> | undefined;
  senderDenomination: string;
  subject: string;
}

export interface NotificationHistory {
  activeFrom: Date;
  relatedTimelineElements: Array<string>;
  status: NotificationHistoryStatus;
}
export interface NotificationRecipient {
  denomination: string;
  paymentId: string | undefined;
  recipientFiscalCode: string;
  type: NotificationRecipientType;
}

type NotificationHistoryStatus =
  | "ACCEPTED"
  | "CANCELLED"
  | "DELIVERED"
  | "DELIVERING"
  | "EFFECTIVE_DATE"
  | "IN_VALIDATION"
  | "PAID"
  | "REFUSED"
  | "UNREACHABLE"
  | "VIEWED";

type NotificationRecipientType = "PF" | "PG";

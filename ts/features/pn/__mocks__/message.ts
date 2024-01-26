import { UIAttachment, UIMessageId } from "../../messages/types";
import { PNMessage } from "../store/types/types";
import { ATTACHMENT_CATEGORY } from "../../messages/types/attachmentCategory";
import { NotificationRecipient } from "../../../../definitions/pn/NotificationRecipient";

export const messageId = "00000000000000000000000004" as UIMessageId;

export const pnMessage: PNMessage = {
  created_at: new Date("2020-01-01T00:00:00.000Z"),
  iun: "731143-7-0317-8200-0",
  subject: "This is the message subject",
  senderDenomination: "Sender denomination",
  abstract: "Message abstract",
  notificationStatusHistory: [],
  recipients: [
    {
      recipientType: "-",
      taxId: "AAABBB00A00A000A",
      denomination: "AaAaAa BbBbBb",
      payment: {
        noticeCode: "026773337463073118",
        creditorTaxId: "00000000009"
      }
    }
  ] as Array<NotificationRecipient>,
  attachments: [
    {
      messageId,
      id: "1",
      displayName: "A First Attachment",
      contentType: "application/pdf",
      category: ATTACHMENT_CATEGORY.DOCUMENT,
      resourceUrl: { href: "/resource/attachment1.pdf" }
    },
    {
      messageId,
      id: "2",
      displayName: "A Second Attachment",
      contentType: "application/pdf",
      category: ATTACHMENT_CATEGORY.DOCUMENT,
      resourceUrl: { href: "/resource/attachment2.pdf" }
    }
  ] as Array<UIAttachment>
};

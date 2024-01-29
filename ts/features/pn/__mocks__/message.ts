import { ThirdPartyMessageWithContent } from "../../../../definitions/backend/ThirdPartyMessageWithContent";
import { message_1 } from "../../messages/__mocks__/message";
import { ATTACHMENT_CATEGORY } from "../../messages/types/attachmentCategory";

export const thirdPartyMessage: ThirdPartyMessageWithContent = {
  ...message_1,
  created_at: new Date("2020-01-01T00:00:00.000Z"),
  third_party_message: {
    details: {
      abstract: "######## abstract ########",
      attachments: [
        {
          messageId: message_1.id,
          id: "1",
          displayName: "A First Attachment",
          contentType: "application/pdf",
          category: ATTACHMENT_CATEGORY.DOCUMENT,
          resourceUrl: { href: "/resource/attachment1.pdf" }
        },
        {
          messageId: message_1.id,
          id: "2",
          displayName: "A Second Attachment",
          contentType: "application/pdf",
          category: ATTACHMENT_CATEGORY.DOCUMENT,
          resourceUrl: { href: "/resource/attachment2.pdf" }
        }
      ],
      iun: "731143-7-0317-8200-0",
      subject: "######## subject ########",
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
      ],
      notificationStatusHistory: [],
      senderDenomination: "Sender denomination"
    }
  }
};

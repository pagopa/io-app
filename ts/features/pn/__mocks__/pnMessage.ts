import { ThirdPartyMessageWithContent } from "../../../../definitions/backend/communication/ThirdPartyMessageWithContent";
import { Denomination } from "../../../../definitions/pn/Denomination";
import { noticeCode } from "../../../../definitions/pn/noticeCode";
import { paTaxId } from "../../../../definitions/pn/paTaxId";
import { TaxId } from "../../../../definitions/pn/TaxId";
import { ThirdPartyAttachment } from "../../../../definitions/pn/ThirdPartyAttachment";
import { ThirdPartyMessage } from "../../../../definitions/pn/ThirdPartyMessage";
import { message_1 } from "../../messages/__mocks__/message";
import { ATTACHMENT_CATEGORY } from "../../messages/types/attachmentCategory";

export const sendThirdPartyMessage: ThirdPartyMessage = {
  attachments: [
    {
      id: "1",
      name: "A First Attachment",
      content_type: "application/pdf",
      category: ATTACHMENT_CATEGORY.DOCUMENT,
      url: "/resource/attachment1.pdf"
    },
    {
      id: "2",
      name: "A Second Attachment",
      content_type: "application/pdf",
      category: ATTACHMENT_CATEGORY.DOCUMENT,
      url: "/resource/attachment2.pdf"
    }
  ] as Array<ThirdPartyAttachment>,
  details: {
    abstract: "######## abstract ########",
    iun: "731143-7-0317-8200-0",
    subject: "######## subject ########",
    recipients: [
      {
        recipientType: "-",
        taxId: "AAABBB00A00A000A" as TaxId,
        denomination: "AaAaAa BbBbBb" as Denomination,
        payment: {
          noticeCode: "026773337463073118" as noticeCode,
          creditorTaxId: "00000000009" as paTaxId
        }
      }
    ],
    notificationStatusHistory: [],
    senderDenomination: "Sender denomination"
  }
};

export const thirdPartyMessage: ThirdPartyMessageWithContent = {
  ...message_1,
  created_at: new Date("2020-01-01T00:00:00.000Z"),
  third_party_message: sendThirdPartyMessage
};

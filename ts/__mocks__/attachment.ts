import { Byte } from "../types/digitalInformationUnit";
import {
  UIMessageId,
  UIAttachment,
  UIAttachmentId
} from "../store/reducers/entities/messages/types";
import { ATTACHMENT_CATEGORY } from "../features/messages/types/attachmentCategory";
import { message_1 } from "./message";

export const mockPdfAttachment: UIAttachment = {
  messageId: message_1.id as UIMessageId,
  id: "1" as UIAttachmentId,
  displayName: "invoice.pdf",
  contentType: "application/pdf",
  size: 1959520 as Byte,
  resourceUrl: { href: "https://www.invoicepdf.com/invoice.pdf" },
  category: ATTACHMENT_CATEGORY.DOCUMENT
};

export const mockOtherAttachment: UIAttachment = {
  messageId: message_1.id as UIMessageId,
  id: "2" as UIAttachmentId,
  displayName: "image.png",
  contentType: "other",
  size: 125952 as Byte,
  resourceUrl: { href: "htts://www.randomImage.com/image.png" },
  category: ATTACHMENT_CATEGORY.F24
};

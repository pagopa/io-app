import { Byte } from "../types/digitalInformationUnit";
import { message_1 } from "./message";
import {
  UIAttachment,
  UIAttachmentId
} from "../store/reducers/entities/messages/types";
import { UIMessageId } from "../store/reducers/entities/messages/types";

export const mockPdfAttachment: UIAttachment = {
  messageId: message_1.id as UIMessageId,
  id: "1" as UIAttachmentId,
  displayName: "invoice.pdf",
  contentType: "application/pdf",
  size: 1959520 as Byte,
  resourceUrl: { href: "https://www.invoicepdf.com/invoice.pdf" }
};

export const mockOtherAttachment: UIAttachment = {
  messageId: message_1.id as UIMessageId,
  id: "2" as UIAttachmentId,
  displayName: "image.png",
  contentType: "other",
  size: 125952 as Byte,
  resourceUrl: { href: "htts://www.randomImage.com/image.png" }
};

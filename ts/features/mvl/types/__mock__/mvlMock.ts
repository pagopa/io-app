import { EmailAddress } from "../../../../../definitions/backend/EmailAddress";
import { Byte } from "../../../../types/digitalInformationUnit";
import {
  MvlAttachment,
  MvlBody,
  MvlData,
  MvlId,
  MvlMetadata
} from "../mvlData";

export const mvlMockId = "mockId" as MvlId;

export const mvlMockBody: MvlBody = {
  html: "This is an html <b>text</b>",
  plain: "This is a plain text"
};

export const mvlMockPdfAttachment: MvlAttachment = {
  name: "invoice.pdf",
  contentType: "application/pdf",
  size: 125952 as Byte,
  resourceUrl: { href: "htts://www.invoicepdf.com/invoce.pdf" }
};

export const mvlMockOtherAttachment: MvlAttachment = {
  name: "image.png",
  contentType: "other",
  size: 125952 as Byte,
  resourceUrl: { href: "htts://www.randomImage.com/image.png" }
};

export const mvlMockMetadata: MvlMetadata = {
  sender: "sender@mailpec.com" as EmailAddress,
  receiver: "receiver@emailpec.com" as EmailAddress,
  cc: ["cc1@emailpec.com" as EmailAddress, "cc2@emailpec.com" as EmailAddress],
  certificates: [],
  signature: null
};

export const mvlMockData: MvlData = {
  id: mvlMockId,
  body: mvlMockBody,
  attachments: [mvlMockPdfAttachment, mvlMockPdfAttachment],
  metadata: mvlMockMetadata
};

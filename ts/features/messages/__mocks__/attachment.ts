import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { ThirdPartyAttachment } from "../../../../definitions/backend/ThirdPartyAttachment";
import { ATTACHMENT_CATEGORY } from "../types/attachmentCategory";

export const mockPdfAttachment: ThirdPartyAttachment = {
  id: "1" as NonEmptyString,
  name: "invoice.pdf" as NonEmptyString,
  content_type: "application/pdf" as NonEmptyString,
  url: "https://www.invoicepdf.com/invoice.pdf" as NonEmptyString,
  category: ATTACHMENT_CATEGORY.DOCUMENT
};

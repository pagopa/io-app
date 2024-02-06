import { INonEmptyStringTag } from "@pagopa/ts-commons/lib/strings";
import { ThirdPartyAttachment } from "../../../../definitions/backend/ThirdPartyAttachment";
import { ATTACHMENT_CATEGORY } from "../types/attachmentCategory";

export const mockPdfAttachment: ThirdPartyAttachment = {
  id: "1" as string & INonEmptyStringTag,
  name: "invoice.pdf" as string & INonEmptyStringTag,
  content_type: "application/pdf" as string & INonEmptyStringTag,
  url: "https://www.invoicepdf.com/invoice.pdf" as string & INonEmptyStringTag,
  category: ATTACHMENT_CATEGORY.DOCUMENT
};

export const mockOtherAttachment: ThirdPartyAttachment = {
  id: "2" as string & INonEmptyStringTag,
  name: "image.png" as string & INonEmptyStringTag,
  content_type: "other" as string & INonEmptyStringTag,
  url: "htts://www.randomImage.com/image.png" as string & INonEmptyStringTag,
  category: ATTACHMENT_CATEGORY.F24
};

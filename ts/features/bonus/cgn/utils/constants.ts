import {
  SupportType,
  SupportTypeEnum
} from "../../../../../definitions/cgn/merchants/SupportType";
import { IOIcons } from "../../../../components/core/icons";

export const EYCA_WEBSITE_BASE_URL = "https://eyca.org";

export const EYCA_WEBSITE_DISCOUNTS_PAGE_URL = `${EYCA_WEBSITE_BASE_URL}/discounts/it`;

export const CGN_MERCHANT_CONTACT_ICONS: Record<SupportType, IOIcons> = {
  [SupportTypeEnum.EMAILADDRESS]: "email",
  [SupportTypeEnum.PHONENUMBER]: "phone",
  [SupportTypeEnum.WEBSITE]: "website"
};

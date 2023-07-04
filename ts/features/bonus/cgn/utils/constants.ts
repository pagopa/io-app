import { IOIcons } from "../../../../components/core/icons";
import { MerchantContactTypeEnum } from "../components/merchants/CgnContactSection";

export const EYCA_WEBSITE_BASE_URL = "https://eyca.org";

export const EYCA_WEBSITE_DISCOUNTS_PAGE_URL = `${EYCA_WEBSITE_BASE_URL}/discounts/it`;

export const CGN_MERCHANT_CONTACT_ICONS: Record<
  MerchantContactTypeEnum,
  IOIcons
> = {
  [MerchantContactTypeEnum.EMAIL]: "email",
  [MerchantContactTypeEnum.PHONE]: "phone",
  [MerchantContactTypeEnum.WEBSITE]: "website"
};

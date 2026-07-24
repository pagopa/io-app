import { ContentWrapper, Divider, ListItemInfo } from "@io-app/design-system";
import I18n from "i18next";

import { Discount } from "../../../../../../../definitions/cgn/merchants/Discount";
import { formatDateAsShortFormat } from "../../../../../../utils/dates";

type CgnDiscountContentProps = {
  discountDetails: Discount;
};

export const CgnDiscountContent = ({
  discountDetails
}: CgnDiscountContentProps) => (
  <ContentWrapper>
    {discountDetails.description && (
      <>
        <ListItemInfo
          label={I18n.t("bonus.cgn.merchantDetail.discount.description")}
          numberOfLines={0}
          value={discountDetails.description}
        />
        <Divider />
      </>
    )}
    {discountDetails.condition && (
      <>
        <ListItemInfo
          label={I18n.t("bonus.cgn.merchantDetail.discount.conditions")}
          numberOfLines={0}
          value={discountDetails.condition}
        />
        <Divider />
      </>
    )}
    {discountDetails.startDate && discountDetails.endDate && (
      <ListItemInfo
        accessibilityLabel={`${I18n.t(
          "bonus.cgn.merchantDetail.discount.validity"
        )} 
          ${I18n.t("bonus.validity_interval", {
            from: formatDateAsShortFormat(discountDetails.startDate),
            to: formatDateAsShortFormat(discountDetails.endDate)
          })}`}
        label={I18n.t("bonus.cgn.merchantDetail.discount.validity")}
        numberOfLines={0}
        value={`${formatDateAsShortFormat(
          discountDetails.startDate
        )} - ${formatDateAsShortFormat(discountDetails.endDate)}`}
      />
    )}
  </ContentWrapper>
);

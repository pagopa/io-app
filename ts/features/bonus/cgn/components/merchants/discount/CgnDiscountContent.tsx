import {
  ContentWrapper,
  Divider,
  ListItemInfo
} from "@pagopa/io-app-design-system";
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
          numberOfLines={0}
          label={I18n.t("bonus.cgn.merchantDetail.discount.description")}
          value={discountDetails.description}
        />
        <Divider />
      </>
    )}
    {discountDetails.condition && (
      <>
        <ListItemInfo
          numberOfLines={0}
          label={I18n.t("bonus.cgn.merchantDetail.discount.conditions")}
          value={discountDetails.condition}
        />
        <Divider />
      </>
    )}
    {discountDetails.startDate && discountDetails.endDate && (
      <ListItemInfo
        numberOfLines={0}
        label={I18n.t("bonus.cgn.merchantDetail.discount.validity")}
        value={`${formatDateAsShortFormat(
          discountDetails.startDate
        )} - ${formatDateAsShortFormat(discountDetails.endDate)}`}
        accessibilityLabel={`${I18n.t(
          "bonus.cgn.merchantDetail.discount.validity"
        )} 
          ${I18n.t("bonus.validity_interval", {
            from: formatDateAsShortFormat(discountDetails.startDate),
            to: formatDateAsShortFormat(discountDetails.endDate)
          })}`}
      />
    )}
  </ContentWrapper>
);

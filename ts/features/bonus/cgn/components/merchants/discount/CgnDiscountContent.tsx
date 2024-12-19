import {
  ContentWrapper,
  Divider,
  ListItemInfo
} from "@pagopa/io-app-design-system";
import { Discount } from "../../../../../../../definitions/cgn/merchants/Discount";
import I18n from "../../../../../../i18n";
import { localeDateFormat } from "../../../../../../utils/locale";

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
        value={`${localeDateFormat(
          discountDetails.startDate,
          I18n.t("global.dateFormats.shortFormat")
        )} - ${localeDateFormat(
          discountDetails.endDate,
          I18n.t("global.dateFormats.shortFormat")
        )}`}
      />
    )}
  </ContentWrapper>
);

import * as React from "react";
import { getCardIconFromBrandLogo } from "../../../../components/wallet/card/Logo";
import { CreditCardPaymentMethod } from "../../../../types/pagopa";
import { dateFromMonthAndYear } from "../../../../utils/dates";
import { isPaymentMethodExpired } from "../../../../utils/paymentMethod";
import I18n from "../../../../i18n";
import { localeDateFormat } from "../../../../utils/locale";
import BaseCoBadgeCard from "./BaseCoBadgeCard";

type Props = { enhancedCoBadge: CreditCardPaymentMethod };

/**
 * Generate the accessibility label for the card.
 */
const getAccessibilityRepresentation = (
  enhancedCoBadge: CreditCardPaymentMethod,
  expiringDate?: Date
) => {
  const cardRepresentation = I18n.t("wallet.accessibility.folded.coBadge", {
    brand: enhancedCoBadge.info.brand,
    bankName:
      enhancedCoBadge.abiInfo?.name ??
      I18n.t("wallet.accessibility.folded.bankNotAvailable")
  });

  const computedValidity =
    expiringDate !== undefined
      ? `, ${I18n.t("cardComponent.validUntil")} ${localeDateFormat(
          expiringDate,
          I18n.t("global.dateFormats.numericMonthYear")
        )}`
      : "";

  return `${cardRepresentation}${computedValidity}`;
};

/**
 * Render a Co-badge card already added to the wallet
 * @param props
 * @constructor
 */
const CoBadgeCard: React.FunctionComponent<Props> = props => {
  const brandLogo = getCardIconFromBrandLogo(props.enhancedCoBadge.info);
  const expiringDate = dateFromMonthAndYear(
    props.enhancedCoBadge.info.expireMonth,
    props.enhancedCoBadge.info.expireYear
  ).toUndefined();

  return (
    <BaseCoBadgeCard
      abi={props.enhancedCoBadge.abiInfo ?? {}}
      isExpired={isPaymentMethodExpired(props.enhancedCoBadge).getOrElse(false)}
      expiringDate={expiringDate}
      brandLogo={brandLogo}
      caption={props.enhancedCoBadge.caption}
      accessibilityLabel={getAccessibilityRepresentation(
        props.enhancedCoBadge,
        expiringDate
      )}
    />
  );
};
export default CoBadgeCard;

import * as React from "react";
import { getCardIconFromBrandLogo } from "../../../../components/wallet/card/Logo";
import { CreditCardPaymentMethod } from "../../../../types/pagopa";
import { dateFromMonthAndYear } from "../../../../utils/dates";
import { isPaymentMethodExpired } from "../../../../utils/paymentMethod";
import BaseCoBadgeCard from "./BaseCoBadgeCard";

type Props = { enhancedCoBadge: CreditCardPaymentMethod };

/**
 * Render a Co-badge card already added to the wallet
 * @param props
 * @constructor
 */
const CoBadgeCard: React.FunctionComponent<Props> = props => {
  const brandLogo = getCardIconFromBrandLogo(props.enhancedCoBadge.info);
  return (
    <BaseCoBadgeCard
      abi={props.enhancedCoBadge.abiInfo ?? {}}
      isExpired={isPaymentMethodExpired(props.enhancedCoBadge).getOrElse(false)}
      expiringDate={dateFromMonthAndYear(
        props.enhancedCoBadge.info.expireMonth,
        props.enhancedCoBadge.info.expireYear
      ).toUndefined()}
      brandLogo={brandLogo}
      caption={props.enhancedCoBadge.caption}
      brand={props.enhancedCoBadge.info.brand}
      bankName={props.enhancedCoBadge.abiInfo?.name}
    />
  );
};
export default CoBadgeCard;

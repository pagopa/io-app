import * as React from "react";
import { getCardIconFromBrandLogo } from "../../../../components/wallet/card/Logo";
import { CreditCardPaymentMethod } from "../../../../types/pagopa";
import BaseCoBadgeCard from "./BaseCoBadgeCard";

type Props = { enhancedCoBadge: CreditCardPaymentMethod };

const getExpireDate = (fullYear?: string, month?: string): Date | undefined => {
  if (!fullYear || !month) {
    return undefined;
  }
  const year = parseInt(fullYear, 10);
  const indexedMonth = parseInt(month, 10);
  if (isNaN(year) || isNaN(indexedMonth)) {
    return undefined;
  }
  return new Date(year, indexedMonth - 1);
};

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
      expiringDate={getExpireDate(
        props.enhancedCoBadge.info.expireYear,
        props.enhancedCoBadge.info.expireMonth
      )}
      brandLogo={brandLogo}
      caption={props.enhancedCoBadge.caption}
    />
  );
};
export default CoBadgeCard;

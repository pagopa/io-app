import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
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
  const expiringDate = O.toUndefined(
    dateFromMonthAndYear(
      props.enhancedCoBadge.info.expireMonth,
      props.enhancedCoBadge.info.expireYear
    )
  );

  return (
    <BaseCoBadgeCard
      abi={props.enhancedCoBadge.abiInfo ?? {}}
      isExpired={pipe(
        isPaymentMethodExpired(props.enhancedCoBadge),
        E.getOrElse(() => false)
      )}
      expiringDate={expiringDate}
      brand={props.enhancedCoBadge.info.brand}
      brandLogo={brandLogo}
      caption={props.enhancedCoBadge.caption}
    />
  );
};
export default CoBadgeCard;

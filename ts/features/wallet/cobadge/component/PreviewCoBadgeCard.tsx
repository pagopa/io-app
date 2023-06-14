import * as React from "react";
import { Abi } from "../../../../../definitions/pagopa/walletv2/Abi";
import { PaymentInstrument } from "../../../../../definitions/pagopa/walletv2/PaymentInstrument";
import { getCardIconFromPaymentNetwork } from "../../../../utils/card";
import {
  getTitleFromPaymentInstrument,
  isCoBadgeBlocked
} from "../../../../utils/paymentMethod";
import BaseCoBadgeCard from "./BaseCoBadgeCard";

type Props = { coBadge: PaymentInstrument; abi: Abi };

/**
 * Display a preview of a cobadge that the user could add to the wallet
 * @constructor
 */
const PreviewCoBadgeCard: React.FunctionComponent<Props> = props => {
  const brandLogo = getCardIconFromPaymentNetwork(props.coBadge.paymentNetwork);
  return (
    <BaseCoBadgeCard
      abi={props.abi}
      expiringDate={props.coBadge.expiringDate}
      blocked={isCoBadgeBlocked(props.coBadge)}
      brand={props.coBadge.paymentNetwork}
      brandLogo={brandLogo}
      caption={getTitleFromPaymentInstrument(props.coBadge)}
    />
  );
};
export default PreviewCoBadgeCard;

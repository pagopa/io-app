import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { profileNameSurnameSelector } from "../../../../../store/reducers/profile";
import { GlobalState } from "../../../../../store/reducers/types";
import { BancomatPaymentMethod } from "../../../../../types/pagopa";
import { isPaymentMethodExpired } from "../../../../../utils/paymentMethod";
import I18n from "../../../../../i18n";
import BaseBancomatCard from "./BaseBancomatCard";

type OwnProps = { enhancedBancomat: BancomatPaymentMethod };

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

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
 * Generate the accessibility label for the card.
 */
const getAccessibilityRepresentation = (
  enhancedBancomat: BancomatPaymentMethod,
  holder?: string
) => {
  const cardRepresentation = I18n.t("wallet.accessibility.folded.bancomat", {
    bankName: enhancedBancomat.caption
  });

  const validity = `${I18n.t("cardComponent.validUntil")} ${getExpireDate(
    enhancedBancomat.info.expireYear,
    enhancedBancomat.info.expireMonth
  )}`;

  const computedHolder =
    typeof holder !== "undefined"
      ? `, ${I18n.t("wallet.accessibility.cardHolder")} ${holder}`
      : "";

  return `${cardRepresentation}, ${validity}${computedHolder}`;
};

/**
 * Render a bancomat already added to the wallet
 * @param props
 * @constructor
 */
const BancomatCard: React.FunctionComponent<Props> = props => (
  <BaseBancomatCard
    accessibilityLabel={getAccessibilityRepresentation(
      props.enhancedBancomat,
      props.nameSurname
    )}
    abi={props.enhancedBancomat.abiInfo ?? {}}
    isExpired={isPaymentMethodExpired(props.enhancedBancomat).getOrElse(false)}
    expiringDate={getExpireDate(
      props.enhancedBancomat.info.expireYear,
      props.enhancedBancomat.info.expireMonth
    )}
    user={props.nameSurname ?? ""}
  />
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  nameSurname: profileNameSurnameSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(BancomatCard);

import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { profileNameSurnameSelector } from "../../../../../store/reducers/profile";
import { GlobalState } from "../../../../../store/reducers/types";
import { BancomatPaymentMethod } from "../../../../../types/pagopa";
import { isPaymentMethodExpired } from "../../../../../utils/paymentMethod";
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
 * Render a bancomat already added to the wallet
 * @param props
 * @constructor
 */
const BancomatCard: React.FunctionComponent<Props> = props => (
  <BaseBancomatCard
    abi={props.enhancedBancomat.abiInfo ?? {}}
    isExpired={pipe(
      isPaymentMethodExpired(props.enhancedBancomat),
      E.getOrElse(() => false)
    )}
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

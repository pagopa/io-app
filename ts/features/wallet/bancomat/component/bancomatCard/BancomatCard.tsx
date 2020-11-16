import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { profileNameSurnameSelector } from "../../../../../store/reducers/profile";
import { GlobalState } from "../../../../../store/reducers/types";
import { EnhancedBancomat } from "../../../../../store/reducers/wallet/wallets";
import BaseBancomatCard from "./BaseBancomatCard";

type OwnProps = { bancomat: EnhancedBancomat };

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

/**
 * Render a bancomat already added to the wallet
 * @param props
 * @constructor
 */
const BancomatCard: React.FunctionComponent<Props> = props => (
  <BaseBancomatCard
    abiLogo={props.bancomat.abiInfo?.logoUrl}
    expiringDate={
      new Date(
        `${props.bancomat.info.expireYear}/${props.bancomat.info.expireMonth}/01`
      )
    }
    user={props.nameSurname ?? ""}
  />
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  nameSurname: profileNameSurnameSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(BancomatCard);

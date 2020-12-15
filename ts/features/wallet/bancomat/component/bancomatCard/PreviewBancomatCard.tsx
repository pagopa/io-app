import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Card } from "../../../../../../definitions/pagopa/walletv2/Card";
import { profileNameSurnameSelector } from "../../../../../store/reducers/profile";
import { GlobalState } from "../../../../../store/reducers/types";
import { Abi } from "../../../../../../definitions/pagopa/walletv2/Abi";
import { isBancomatBlocked } from "../../../../../utils/paymentMethod";
import BaseBancomatCard from "./BaseBancomatCard";

type OnboardingData = { bancomat: Card; abi: Abi };

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OnboardingData;

/**
 * Display a preview of a bancomat that the user could add to the wallet
 * @constructor
 */
const PreviewBancomatCard: React.FunctionComponent<Props> = props => (
  <BaseBancomatCard
    abi={props.abi}
    expiringDate={props.bancomat.expiringDate}
    user={props.nameSurname ?? ""}
    blocked={isBancomatBlocked(props.bancomat)}
  />
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  nameSurname: profileNameSurnameSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PreviewBancomatCard);

import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Card } from "../../../../../../definitions/pagopa/walletv2/Card";
import { profileNameSurnameSelector } from "../../../../../store/reducers/profile";
import { GlobalState } from "../../../../../store/reducers/types";
import BaseBancomatCard from "./BaseBancomatCard";

type OnboardingData = { bancomat: Card; logoUrl?: string };

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OnboardingData;

/**
 * Display a preview of a bancomat that the user could add to the wallet
 * @constructor
 */
const PreviewBancomatCard: React.FunctionComponent<Props> = props => (
  <BaseBancomatCard
    abiLogo={props.logoUrl}
    expiringDate={props.bancomat.expiringDate}
    user={props.nameSurname ?? ""}
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

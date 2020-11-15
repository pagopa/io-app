import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Card } from "../../../../../../definitions/pagopa/walletv2/Card";
import { profileNameSurnameSelector } from "../../../../../store/reducers/profile";
import { GlobalState } from "../../../../../store/reducers/types";
import { EnhancedBancomat } from "../../../../../store/reducers/wallet/wallets";
import { XOR } from "../../../../../types/utils";
import BaseBancomatCard from "./BaseBancomatCard";

/**
 * A bancomat could be represented from the onboarding data {@link Card} or
 * from the wallet data {@link EnhancedBancomat}
 */
type OwnProps = { bancomat: XOR<Card, EnhancedBancomat> };

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const isEnhancedBancomat = (
  bancomat: XOR<Card, EnhancedBancomat>
): bancomat is EnhancedBancomat =>
  (bancomat as EnhancedBancomat).onboardingChannel !== undefined;

const generateProps = (
  props: Props
): Omit<React.ComponentProps<typeof BaseBancomatCard>, "children"> => {
  // EnhancedBancomat
  if (isEnhancedBancomat(props.bancomat)) {
    return {
      abiLogo: props.bancomat.abiInfo?.logoUrl,
      expiringDate: new Date(
        `${props.bancomat.info.expireYear}/${props.bancomat.info.expireMonth}/01`
      ),
      user: props.nameSurname ?? ""
    };
  } else {
    return {
      abiLogo: "",
      expiringDate: props.bancomat.expiringDate,
      user: props.nameSurname ?? ""
    };
  }
};

const BancomatCard: React.FunctionComponent<Props> = props => (
  <BaseBancomatCard {...generateProps(props)} />
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  nameSurname: profileNameSurnameSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(BancomatCard);

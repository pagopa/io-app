import * as pot from "italia-ts-commons/lib/pot";
import React from "react";
import { connect } from "react-redux";

import { getUnreadTransactionsSelector } from "../store/reducers/entities/readTransactions";
import { GlobalState } from "../store/reducers/types";
import TabIconComponent from "./ui/TabIconComponent";
import { isProfileEmailValidatedSelector } from "../store/reducers/profile";

type OwnProps = {
  color?: string;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

/**
 * Wallet tab icon with badge indicator
 */
class WalletTabIcon extends React.PureComponent<Props> {
  public render() {
    const { color, unreadTransactions } = this.props;
    return (
      <TabIconComponent
        iconName={"io-portafoglio"}
        badgeValue={unreadTransactions}
        color={color}
      />
    );
  }
}

function mapStateToProps(state: GlobalState) {
  const transactions = getUnreadTransactionsSelector(state);
  const isEmailValidated = isProfileEmailValidatedSelector(state);
  const unreadTransactions =
    pot.isSome(transactions) && isEmailValidated
      ? Object.keys(transactions.value).length
      : 0;

  return {
    unreadTransactions
  };
}

export default connect(mapStateToProps)(WalletTabIcon);

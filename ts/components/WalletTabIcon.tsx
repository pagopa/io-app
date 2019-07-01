import * as pot from "italia-ts-commons/lib/pot";
import { Badge, View } from "native-base";
import React from "react";
import { Platform, StyleSheet, Text } from "react-native";
import { connect } from "react-redux";
import { getUnreadTransactions } from "../store/reducers/entities/readTransactions";
import { GlobalState } from "../store/reducers/types";
import variables from "../theme/variables";
import IconFont from "./ui/IconFont";

type OwnProps = {
  color?: string;
};
const MAX_BADGE_VALUE = 99;
const styles = StyleSheet.create({
  textBadgeStyle: {
    fontSize: 10,
    fontFamily: "Titillium Web",
    fontWeight: "bold",
    color: "white",
    flex: 1,
    position: "absolute",
    height: 19,
    width: 19,
    textAlign: "center",
    paddingRight: 4,
    top: Platform.OS === "ios" ? 0 : undefined
  },
  badgeStyle: {
    backgroundColor: variables.brandPrimary,
    borderColor: "white",
    borderWidth: 2,
    position: "absolute",
    elevation: 0.1,
    shadowColor: "white",
    height: 19,
    width: 19,
    left: 12,
    bottom: 10
  }
});

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

/**
 * Wallet Tab + Badge indicator.
 */
class WalletTabIcon extends React.PureComponent<Props> {
  public render() {
    const { color, badgeValue } = this.props;
    return (
      <View>
        <IconFont
          name={"io-portafoglio"}
          size={variables.iconSize3}
          color={color}
        />
        {badgeValue > 0 ? (
          <Badge style={styles.badgeStyle}>
            <Text style={[styles.textBadgeStyle]}>{badgeValue}</Text>
          </Badge>
        ) : null}
      </View>
    );
  }
}

function mapStateToProps(state: GlobalState) {
  const transactions = getUnreadTransactions(state);
  // TODO modify here to get WALLET TRANSACTIONS UNREAD
  return {
    badgeValue: Math.min(
      pot.getOrElse(transactions, []).length,
      MAX_BADGE_VALUE
    )
  };
}

export default connect(mapStateToProps)(WalletTabIcon);

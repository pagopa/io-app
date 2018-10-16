import { View } from "native-base";
import * as React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { Wallet } from "../../../types/pagopa";
import { WalletStyles } from "../../styles/wallet";
import CardComponent from "./CardComponent";
import { LogoPosition } from "./Logo";

const styles = StyleSheet.create({
  firstCard: {
    flex: 1,
    shadowRadius: 10,
    shadowOpacity: 0.15,
    transform: [{ perspective: 700 }, { rotateX: "-20deg" }, { scaleX: 0.98 }],
    zIndex: -10
  },
  secondCard: {
    flex: 1,
    shadowRadius: 10,
    shadowOpacity: 0.15,
    transform: [
      { perspective: 700 },
      { rotateX: "-20deg" },
      { translateY: -(58 / 2 + 20) * (1 - Math.cos(20)) },
      { scaleX: 0.98 }
    ],
    zIndex: -10
  },
  shiftDown: {
    marginBottom: -(58 / 2 + 1)
  }
});

type Props = Readonly<{
  wallets: [Wallet] | [Wallet, Wallet];
  navigateToWalletList: () => void;
}>;

const CardsFan: React.SFC<Props> = props => {
  const { wallets } = props;

  const commonProps = {
    logoPosition: LogoPosition.TOP,
    flatBottom: true,
    headerOnly: true
  };

  return (
    <TouchableOpacity onPress={props.navigateToWalletList}>
      {wallets.length === 1 ? (
        <View style={WalletStyles.container}>
          <CardComponent {...commonProps} wallet={wallets[0]} rotated={true} />
        </View>
      ) : (
        <View style={styles.shiftDown}>
          <View style={styles.firstCard}>
            <CardComponent {...commonProps} wallet={wallets[0]} />
          </View>
          <View style={styles.secondCard}>
            <CardComponent {...commonProps} wallet={wallets[1]} />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CardsFan;

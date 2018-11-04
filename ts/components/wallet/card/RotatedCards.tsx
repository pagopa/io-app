import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";

import { Wallet } from "../../../types/pagopa";
import CardComponent from "./CardComponent";

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
  containerOneCard: {
    marginBottom: -4
  },
  containerTwoCards: {
    marginBottom: -(58 / 2 + 1)
  }
});

interface Props {
  wallets: [Wallet] | [Wallet, Wallet];
  cardType: "Preview";
}

export class RotatedCards extends React.PureComponent<Props, {}> {
  public render() {
    const { wallets, cardType } = this.props;

    return (
      <View
        style={
          wallets.length === 2
            ? styles.containerTwoCards
            : styles.containerOneCard
        }
      >
        <View style={styles.firstCard}>
          <CardComponent type={cardType} wallet={wallets[0]} />
        </View>
        {typeof wallets[1] !== "undefined" && (
          <View style={styles.secondCard}>
            <CardComponent type={cardType} wallet={wallets[1]} />
          </View>
        )}
      </View>
    );
  }
}

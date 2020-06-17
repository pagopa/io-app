import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import I18n from "../../../i18n";

import { Wallet } from "../../../types/pagopa";
import TouchableDefaultOpacity from '../../TouchableDefaultOpacity';
import CreditCardStyles from "./../card/CardComponent.style";
import {CreditCardStyles as CreditCardStyles2} from "./../card/style";
import CardComponent from "./CardComponent";
import Logo from './Logo';

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
      { translateY: -(58 / 2 + 20) * (1 - Math.cos(20)) }, // card preview height: 58
      { scaleX: 0.98 }
    ],
    zIndex: -10
  },
  containerOneCard: {
    marginBottom: -4,
    marginTop: -(58 / 2) * (1 - Math.cos(20)) 
  },
  containerTwoCards: {
    marginBottom: -(58 / 2 + 1),
    marginTop: -(58 / 2) * (1 - Math.cos(20))
  }
});

interface Props {
  // tslint-prettier doesn't yet support the readonly tuple syntax
  // tslint:disable-next-line:prettier
  wallets?: readonly [Wallet] | readonly [Wallet, Wallet];
  cardType: "Preview";
  onClick: () => void;
}

export class RotatedCards extends React.PureComponent<Props, {}> {
  
  private emptyCardPreview(): React.ReactNode {
    const FOUR_UNICODE_CIRCLES = "\u25cf".repeat(4);
    const HIDDEN_CREDITCARD_NUMBERS = `${FOUR_UNICODE_CIRCLES} `.repeat(4);
    return(
      <View style={[styles.firstCard, styles.containerOneCard]}>
        <View style={[CreditCardStyles.card,CreditCardStyles.flatBottom]}>
          <View style={[CreditCardStyles.cardInner, CreditCardStyles.row]}>
            <View
              style={[CreditCardStyles.row, CreditCardStyles.numberArea]} 
            >
              <Text style={[CreditCardStyles2.smallTextStyle]}>
                {`${HIDDEN_CREDITCARD_NUMBERS}`}
              </Text>
            </View>
            <View style={CreditCardStyles.cardLogo}>
              <Logo/>
            </View>
          </View>
        </View>
      </View>
    )
  }

  public render() {
    const { wallets, cardType, onClick } = this.props;

    return (
      wallets === undefined 
      ? (
        <View>
          <Text white={true}>
            {I18n.t("wallet.delete.alert")}
          </Text> 
          {this.emptyCardPreview()}
        </View> 
      ) : (
        <View
          style={
            wallets.length === 2
              ? styles.containerTwoCards
              : styles.containerOneCard
          }
        >
          <View spacer={true} />
          <TouchableDefaultOpacity onPress={onClick}>
            <View style={styles.firstCard}>
              <CardComponent type={cardType} wallet={wallets[0]} />
            </View>
            {typeof wallets[1] !== "undefined" && (
              <React.Fragment>
                <View spacer={true}/>
                <View style={styles.secondCard}>
                  <CardComponent type={cardType} wallet={wallets[1]} />
                </View>
              </React.Fragment>
            )}
          </TouchableDefaultOpacity>
        </View>
      )  
    );
  }
}

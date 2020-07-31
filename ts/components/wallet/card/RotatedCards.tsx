import { Text, View } from "native-base";
import * as React from "react";
import { Platform, StyleSheet } from "react-native";
import I18n from "../../../i18n";

import { Wallet } from "../../../types/pagopa";
import TouchableDefaultOpacity from '../../TouchableDefaultOpacity';
import CreditCardStyles from "./../card/CardComponent.style";
import {CreditCardStyles as CreditCardStyles2} from "./../card/style";
import CardComponent from "./CardComponent";
import Logo from './Logo';

const styles = StyleSheet.create({
  rotadedCard: {
    shadowColor: "#000",
    marginBottom: -30,
    flex: 1,
    shadowRadius: 10,
    shadowOpacity: 0.15,
    transform: [{ perspective: 1200 }, { rotateX: "-20deg" }, { scaleX: 0.99 }],
  },
  container: {
    marginBottom: -4
  },
  shadowBox: {
    marginBottom: -15,
    borderRadius: 8,
    borderTopWidth: 8,
    borderTopColor: "rgba(0,0,0,0.1)",
    height: 15
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
      <View style={[styles.rotadedCard]}>
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
        <View style={styles.container}>
          <TouchableDefaultOpacity 
            onPress={onClick}
            accessible={true}
            accessibilityLabel={I18n.t("wallet.accessibility.cardsPreview")}
            accessibilityRole={"button"}
          >
            {Platform.OS === "android" && <View
              style={styles.shadowBox}
            />}
            <View style={styles.rotadedCard}>
              <CardComponent type={cardType} wallet={wallets[0]} />
            </View>
            {typeof wallets[1] !== "undefined" && (
              <>
              <View spacer={true} />
                {Platform.OS === "android" && <View
                  style={styles.shadowBox}
                />}
              <View style={styles.rotadedCard}>
                <CardComponent type={cardType} wallet={wallets[1]} />
              </View>
              </>
            )}
          </TouchableDefaultOpacity>
          <View spacer={true}/>
        </View>
      )  
    );
  }
}

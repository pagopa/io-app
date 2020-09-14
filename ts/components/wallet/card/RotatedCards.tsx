import { Text, View } from "native-base";
import * as React from "react";
import { Platform, StyleSheet } from "react-native";
import I18n from "../../../i18n";

import { Wallet } from "../../../types/pagopa";
import TouchableDefaultOpacity from "../../TouchableDefaultOpacity";
import CreditCardStyles from "./../card/CardComponent.style";
import { CreditCardStyles as CreditCardStyles2 } from "./../card/style";
import CardComponent from "./CardComponent";
import Logo from "./Logo";

const styles = StyleSheet.create({
  rotatedCard: {
    shadowColor: "#000",
    marginBottom: -30,
    flex: 1,
    shadowRadius: 10,
    shadowOpacity: 0.15,
    transform: [{ perspective: 1200 }, { rotateX: "-20deg" }, { scaleX: 0.99 }]
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

const FOUR_UNICODE_CIRCLES = "\u25cf".repeat(4);
const HIDDEN_CREDITCARD_NUMBERS = `${FOUR_UNICODE_CIRCLES} `.repeat(4);

interface Props {
  // tslint-prettier doesn't yet support the readonly tuple syntax
  // eslint-disable-next-line
  wallets?: ReadonlyArray<Wallet>;
  onClick: () => void;
}

export class RotatedCards extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.cardPreview = this.cardPreview.bind(this);
  }

  private emptyCardPreview(): React.ReactNode {
    return (
      <View style={[styles.rotatedCard]}>
        <View style={[CreditCardStyles.card, CreditCardStyles.flatBottom]}>
          <View style={[CreditCardStyles.cardInner, CreditCardStyles.row]}>
            <View style={[CreditCardStyles.row, CreditCardStyles.numberArea]}>
              <Text style={[CreditCardStyles2.smallTextStyle]}>
                {`${HIDDEN_CREDITCARD_NUMBERS}`}
              </Text>
            </View>
            <View style={CreditCardStyles.cardLogo}>
              <Logo />
            </View>
          </View>
        </View>
      </View>
    );
  }

  private cardPreview(wallet: Wallet, isLastItem: boolean): React.ReactNode {
    const { onClick } = this.props;
    if (wallet === undefined) {
      return undefined;
    }
    return (
      <>
        <TouchableDefaultOpacity
          key={`wallet_${wallet.idWallet}`}
          onPress={onClick}
          accessible={true}
          accessibilityLabel={I18n.t("wallet.accessibility.cardsPreview")}
          accessibilityRole={"button"}
        >
          {Platform.OS === "android" && <View style={styles.shadowBox} />}
          <View style={styles.rotatedCard}>
            <CardComponent type={"Preview"} wallet={wallet} />
          </View>
        </TouchableDefaultOpacity>
        {!isLastItem && <View spacer={true} />}
      </>
    );
  }

  public render() {
    const { wallets } = this.props;

    return wallets === undefined ? (
      <View>
        <Text white={true}>{I18n.t("wallet.delete.alert")}</Text>
        {this.emptyCardPreview()}
      </View>
    ) : (
      <View style={styles.container}>
        {wallets.map((w, idx) =>
          this.cardPreview(w, idx === wallets.length - 1)
        )}
        <View spacer={true} />
      </View>
    );
  }
}

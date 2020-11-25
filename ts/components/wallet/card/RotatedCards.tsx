import { Text, View } from "native-base";
import * as React from "react";
import { Platform, StyleSheet } from "react-native";
import { fromNullable } from "fp-ts/lib/Option";
import I18n from "../../../i18n";

import { Wallet } from "../../../types/pagopa";
import { FOUR_UNICODE_CIRCLES } from "../../../utils/wallet";
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

interface Props {
  wallets?: ReadonlyArray<Wallet>;
  onClick: (wallet: Wallet) => void;
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
                {`${FOUR_UNICODE_CIRCLES}`}
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
    return fromNullable(wallet).fold(undefined, w => (
      <React.Fragment key={`wallet_${w.idWallet}`}>
        <TouchableDefaultOpacity
          onPress={() => onClick(w)}
          accessible={true}
          accessibilityLabel={I18n.t("wallet.accessibility.cardsPreview")}
          accessibilityRole={"button"}
        >
          {Platform.OS === "android" && <View style={styles.shadowBox} />}
          <View style={styles.rotatedCard}>
            <CardComponent type={"Preview"} wallet={w} />
          </View>
        </TouchableDefaultOpacity>
        {!isLastItem && <View spacer={true} />}
      </React.Fragment>
    ));
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

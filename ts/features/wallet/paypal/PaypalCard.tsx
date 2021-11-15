import * as React from "react";
import * as pot from "italia-ts-commons/lib/pot";
import { Image, StyleSheet } from "react-native";
import { View } from "native-base";
import { connect } from "react-redux";
import BaseCardComponent from "../component/card/BaseCardComponent";
import paypalLogoExt from "../../../../img/wallet/payment-methods/paypal-logo.png";
import paypalLogoMin from "../../../../img/wallet/cards-icons/paypal.png";
import { Body } from "../../../components/core/typography/Body";
import { BrandImage } from "../component/card/BrandImage";
import { GlobalState } from "../../../store/reducers/types";
import { getFavoriteWalletId } from "../../../store/reducers/wallet/wallets";
import IconFont from "../../../components/ui/IconFont";
import variables from "../../../theme/variables";
import { IOStyles } from "../../../components/core/variables/IOStyles";

type Props = {
  email: string;
  idWallet: number;
} & ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  paypalLogoExt: {
    width: 132,
    height: 33,
    resizeMode: "contain"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  }
});

const topLeft = (isFavourite: boolean) => (
  <View style={styles.row}>
    <View style={IOStyles.flex}>
      <Image source={paypalLogoExt} style={styles.paypalLogoExt} />
    </View>
    {isFavourite && (
      <IconFont name={"io-filled-star"} color={variables.brandPrimary} />
    )}
  </View>
);

const PaypalCard: React.FunctionComponent<Props> = (props: Props) => (
  <BaseCardComponent
    topLeftCorner={topLeft(
      pot.getOrElse(
        pot.map(props.favoriteWalletId, id => props.idWallet === id),
        false
      )
    )}
    bottomLeftCorner={<Body>{props.email}</Body>}
    bottomRightCorner={<BrandImage image={paypalLogoMin} />}
  />
);

const mapStateToProps = (state: GlobalState) => ({
  favoriteWalletId: getFavoriteWalletId(state)
});

export default connect(mapStateToProps)(PaypalCard);

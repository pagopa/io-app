import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { View, Image, StyleSheet } from "react-native";
import { connect } from "react-redux";
import paypalLogoMin from "../../../../img/wallet/cards-icons/paypal_card.png";
import paypalLogoExt from "../../../../img/wallet/payment-methods/paypal-logo.png";
import { Body } from "../../../components/core/typography/Body";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import I18n from "../../../i18n";
import { GlobalState } from "../../../store/reducers/types";
import { getFavoriteWalletId } from "../../../store/reducers/wallet/wallets";
import { PayPalPaymentMethod } from "../../../types/pagopa";
import { getPaypalAccountEmail } from "../../../utils/paypal";
import BaseCardComponent from "../component/card/BaseCardComponent";
import { BrandImage } from "../component/card/BrandImage";
import { Icon } from "../../../components/core/icons/Icon";

type Props = {
  paypal: PayPalPaymentMethod;
} & ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  paypalLogoExt: {
    width: 132,
    height: 33,
    resizeMode: "contain"
  },
  bottomLeftStyle: {
    ...IOStyles.flex,
    paddingRight: 16
  }
});

/**
 * Generate the accessibility label for the card.
 */
const getAccessibilityRepresentation = (email: string) => {
  const paypal = I18n.t("wallet.onboarding.paypal.name");

  return `${paypal}, ${email}`;
};

const topLeft = (isFavourite: boolean) => (
  <View style={IOStyles.rowSpaceBetween}>
    <View style={IOStyles.flex}>
      <Image source={paypalLogoExt} style={styles.paypalLogoExt} />
    </View>
    {isFavourite && <Icon name="starFilled" color="blue" />}
  </View>
);

const PaypalCard: React.FunctionComponent<Props> = (props: Props) => {
  const emailAccount = getPaypalAccountEmail(props.paypal.info);

  return (
    <BaseCardComponent
      accessibilityLabel={getAccessibilityRepresentation(emailAccount)}
      topLeftCorner={topLeft(
        pot.getOrElse(
          pot.map(props.favoriteWalletId, id => props.paypal.idWallet === id),
          false
        )
      )}
      bottomLeftCorner={
        <Body style={styles.bottomLeftStyle} numberOfLines={1}>
          {emailAccount}
        </Body>
      }
      bottomRightCorner={<BrandImage image={paypalLogoMin} />}
    />
  );
};

const mapStateToProps = (state: GlobalState) => ({
  favoriteWalletId: getFavoriteWalletId(state)
});

export default connect(mapStateToProps)(PaypalCard);

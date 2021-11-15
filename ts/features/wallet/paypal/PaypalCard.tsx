import * as React from "react";
import { Image, StyleSheet } from "react-native";
import BaseCardComponent from "../component/card/BaseCardComponent";
import paypalLogoExt from "../../../../img/wallet/payment-methods/paypal-logo.png";
import satispayLogoMin from "../../../../img/wallet/cards-icons/satispay.png";
import { Body } from "../../../components/core/typography/Body";
import { BrandImage } from "../component/card/BrandImage";

type Props = {
  email: string;
};

const styles = StyleSheet.create({
  paypalLogoExt: {
    width: 132,
    height: 33,
    resizeMode: "contain"
  }
});

export const PaypalCard: React.FunctionComponent<Props> = (props: Props) => (
  <BaseCardComponent
    topLeftCorner={
      <Image source={paypalLogoExt} style={styles.paypalLogoExt} />
    }
    bottomLeftCorner={<Body>{props.email}</Body>}
    bottomRightCorner={<BrandImage image={satispayLogoMin} />}
  />
);

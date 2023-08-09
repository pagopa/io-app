import * as React from "react";
import { Image } from "react-native";
import paypalLogoImage from "../../../img/wallet/payment-methods/paypal-logo.png";
// sadly no svg is available for paypal, since on Figma an image is used
import BpayLogo from "../../../img/wallet/payment-methods/bpay_logo_full.svg";
import { BankLogoOrSkeleton } from "./utils/components/BankLogoOrLoadingSkeleton";
type LogoPaymentHugeProps = {
  dimensions: { height: number; width: number };
  icon?: "payPal" | "bpay";
  abiCode?: string;
};

export const LogoPaymentExtended = (props: LogoPaymentHugeProps) => {
  const { height, width } = props.dimensions;
  if ("icon" in props) {
    switch (props.icon) {
      case "payPal":
        return (
          <Image
            source={paypalLogoImage}
            resizeMode="contain"
            style={{ height, width }}
          />
        );
      case "bpay":
        return <BpayLogo height={height} width={width} />;
    }
  }

  return (
    <BankLogoOrSkeleton dimensions={props.dimensions} abiCode={props.abiCode} />
  );
};

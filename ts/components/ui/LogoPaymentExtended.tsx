import { Image } from "react-native";
import paypalLogoImage from "../../../img/wallet/payment-methods/paypal-logo.png";
// sadly no svg is available for paypal, since on Figma an image is used
import BpayLogo from "../../../img/wallet/payment-methods/bpay_logo_full.svg";
import { BankLogoOrSkeleton } from "../../features/payments/common/components/utils/BankLogoOrLoadingSkeleton";
export type LogoPaymentExtendedProps = {
  dimensions: { height: number; width: number };
} & (
  | {
      icon?: never;
      abiCode: string | undefined;
      imageA11yLabel?: string;
    }
  | {
      icon: "payPal" | "bpay";
    }
);

export const LogoPaymentExtended = (props: LogoPaymentExtendedProps) => {
  const { height, width } = props.dimensions;
  if ("icon" in props) {
    switch (props.icon) {
      case "payPal":
        return (
          <Image
            accessibilityIgnoresInvertColors
            accessible={true}
            accessibilityLabel="PayPal"
            source={paypalLogoImage}
            resizeMode="contain"
            style={{ height, width }}
          />
        );
      case "bpay":
        return (
          <BpayLogo
            accessible={true}
            accessibilityLabel="BANCOMAT Pay"
            height={height}
            width={width}
          />
        );
    }
  }

  return (
    <BankLogoOrSkeleton
      imageA11yLabel={props.imageA11yLabel}
      dimensions={props.dimensions}
      abiCode={props.abiCode}
    />
  );
};

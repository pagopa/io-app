import PaypalLogo from "../../../img/wallet/payment-methods/paypal/paypal_logo_ext.svg";
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
          <PaypalLogo
            accessible={true}
            accessibilityLabel="PayPal"
            height={height}
            width={width}
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

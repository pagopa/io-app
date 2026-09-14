import I18n from "i18next";

import BpayLogo from "../../../img/wallet/payment-methods/bpay_logo_full.svg";
import PaypalLogo from "../../../img/wallet/payment-methods/paypal/paypal_logo_ext.svg";
import { BankLogoOrSkeleton } from "../../features/payments/common/components/utils/BankLogoOrLoadingSkeleton";
export type LogoPaymentExtendedProps = (
  | {
      abiCode: string | undefined;
      icon?: never;
      imageA11yLabel?: string;
    }
  | {
      icon: "bpay" | "payPal";
    }
) & {
  dimensions: { height: number; width: number };
};

export const LogoPaymentExtended = (props: LogoPaymentExtendedProps) => {
  const { height, width } = props.dimensions;
  if ("icon" in props) {
    switch (props.icon) {
      case "bpay":
        return (
          <BpayLogo
            accessibilityLabel={I18n.t("wallet.onboarding.bancomatPay.name")}
            accessible={true}
            height={height}
            width={width}
          />
        );
      case "payPal":
        return (
          <PaypalLogo
            accessibilityLabel={I18n.t("wallet.onboarding.paypal.name")}
            accessible={true}
            height={height}
            width={width}
          />
        );
    }
  }

  return (
    <BankLogoOrSkeleton
      abiCode={props.abiCode}
      dimensions={props.dimensions}
      imageA11yLabel={props.imageA11yLabel}
    />
  );
};

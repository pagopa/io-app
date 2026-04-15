import {
  IOColors,
  Icon,
  IOIconSizeScale,
  IOLogoPaymentExtType,
  IOLogoPaymentType,
  IOPaymentExtLogos,
  IOPaymentLogos,
  LogoPayment,
  LogoPaymentExt,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { findFirstCaseInsensitive } from "../../../../utils/object";

export type LogoPaymentWithFallback = {
  brand?: string;
  fallbackIconColor?: IOColors;
  size?: IOIconSizeScale;
  isExtended?: boolean;
};
export type LogoPaymentExtOrDefaultIconProps = {
  cardIcon?: IOLogoPaymentExtType;
  fallbackIconColor?: IOColors;
  size?: IOIconSizeScale;
};
/**
 * This component renders either
 * - a LogoPayment/LogoPaymentExt component
 * - a default credit card icon
 * @param cardIcon: IOLogoPaymentType icon
 * @param size: the size of the icon (standard is 24/48)
 * @param fallbackIconColor: default icon color (standard is grey-700)
 * @param isExtended: if true, renders a LogoPaymentExt component
 * @returns a LogoPayment/LogopaymentExt component if the cardIcon is supported, a default credit card icon otherwise
 */
export const LogoPaymentWithFallback = ({
  brand,
  fallbackIconColor,
  isExtended = false,
  size = isExtended ? 48 : 24
}: LogoPaymentWithFallback) => {
  const theme = useIOTheme();

  const logos = isExtended ? IOPaymentExtLogos : IOPaymentLogos;

  return pipe(
    brand,
    O.fromNullable,
    O.chain(findFirstCaseInsensitive(logos)),
    O.map(([brand]) => brand),
    O.fold(
      () => (
        <Icon
          name="creditCard"
          size={size}
          color={fallbackIconColor ?? theme["icon-default"]}
        />
      ),
      brand =>
        isExtended ? (
          <LogoPaymentExt name={brand as IOLogoPaymentExtType} size={size} />
        ) : (
          <LogoPayment name={brand as IOLogoPaymentType} size={size} />
        )
    )
  );
};

import {
  Icon,
  IOColors,
  IOIconSizeScale,
  IOLogoPaymentExtType,
  IOLogoPaymentType,
  IOPaymentExtLogos,
  IOPaymentLogos,
  LogoPayment,
  LogoPaymentExt,
  useIOTheme
} from "@io-app/design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { findFirstCaseInsensitive } from "../../../../utils/object";

export type LogoPaymentExtOrDefaultIconProps = {
  cardIcon?: IOLogoPaymentExtType;
  fallbackIconColor?: IOColors;
  size?: IOIconSizeScale;
};
export type LogoPaymentWithFallback = {
  brand?: string;
  fallbackIconColor?: IOColors;
  isExtended?: boolean;
  size?: IOIconSizeScale;
};
/**
 * This component renders either - a LogoPayment/LogoPaymentExt component - a
 * default credit card icon
 *
 * @param cardIcon: IOLogoPaymentType icon
 * @param size: The size of the icon (standard is 24/48)
 * @param fallbackIconColor: Default icon color (standard is grey-700)
 * @param isExtended: If true, renders a LogoPaymentExt component
 * @returns A LogoPayment/LogopaymentExt component if the cardIcon is supported,
 *   a default credit card icon otherwise
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
          color={fallbackIconColor ?? theme["icon-default"]}
          name="creditCard"
          size={size}
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

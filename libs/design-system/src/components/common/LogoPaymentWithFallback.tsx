import { IOColors } from "../../core";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { findFirstCaseInsensitive } from "../../utils/object";
import { Icon, IOIconSizeScale } from "../icons";
import {
  IOLogoPaymentExtType,
  IOLogoPaymentType,
  IOPaymentExtLogos,
  IOPaymentLogos,
  LogoPayment,
  LogoPaymentExt
} from "../logos";

type LogoPaymentWithFallbackProps = {
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
  fallbackIconColor = "grey-700",
  isExtended = false,
  size = isExtended ? 48 : 24
}: LogoPaymentWithFallbackProps) => {
  const { dynamicFontScale } = useIOFontDynamicScale();
  const logos = isExtended ? IOPaymentExtLogos : IOPaymentLogos;

  if (!brand) {
    return (
      <Icon
        allowFontScaling
        color={fallbackIconColor}
        name="creditCard"
        size={size}
      />
    );
  }

  const findCase = findFirstCaseInsensitive(logos, brand);

  if (!findCase) {
    return (
      <Icon
        allowFontScaling
        color={fallbackIconColor}
        name="creditCard"
        size={size}
      />
    );
  }

  return isExtended ? (
    <LogoPaymentExt
      name={findCase as IOLogoPaymentExtType}
      size={size * dynamicFontScale}
    />
  ) : (
    <LogoPayment
      name={findCase as IOLogoPaymentType}
      size={size * dynamicFontScale}
    />
  );
};

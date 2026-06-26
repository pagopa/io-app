import { IOColors } from "../../core";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { findFirstCaseInsensitive } from "../../utils/object";
import { IOIconSizeScale, Icon } from "../icons";
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
  size?: IOIconSizeScale;
  isExtended?: boolean;
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
        name="creditCard"
        size={size}
        color={fallbackIconColor}
      />
    );
  }

  const findCase = findFirstCaseInsensitive(logos, brand);

  if (!findCase) {
    return (
      <Icon
        allowFontScaling
        name="creditCard"
        size={size}
        color={fallbackIconColor}
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

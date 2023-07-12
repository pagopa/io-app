import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { IOIconSizeScale, Icon } from "../../../core/icons";
import { IOLogoPaymentType, LogoPayment } from "../../../core/logos";
import { IOColors } from "../../../core/variables/IOColors";

export type LogoPaymentOrDefaultIconProps = {
  cardIcon?: IOLogoPaymentType;
  fallbackIconColor?: IOColors;
  size?: IOIconSizeScale;
};
/**
 * This component renders either
 * - a LogoPayment component
 * - a default credit card icon
 * @param cardIcon: IOLogoPaymentType icon
 * @param size: the size of the icon (standard is 24)
 * @param fallbackIconColor: default icon color (standard is grey-700)
 * @returns a LogoPayment component if the cardIcon is supported, a default credit card icon otherwise
 */
export const LogoPaymentOrDefaultIcon = ({
  cardIcon,
  size = 24,
  fallbackIconColor = "grey-700"
}: LogoPaymentOrDefaultIconProps) =>
  pipe(
    cardIcon,
    O.fromNullable,
    O.fold(
      // would be a cleaner solution to create an io-ts type and decode
      // but it's not worth the effort for now
      () => <Icon name="creditCard" size={size} color={fallbackIconColor} />,
      icon => <LogoPayment name={icon} size={size} />
    )
  );

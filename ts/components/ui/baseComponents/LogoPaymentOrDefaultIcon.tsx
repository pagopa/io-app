import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { IOIconSizeScale, Icon } from "../../core/icons";
import { IOLogoPaymentType, LogoPayment } from "../../core/logos";
import { IOColors } from "../../core/variables/IOColors";

export const LogoPaymentOrDefaultIcon = ({
  cardIcon,
  size,
  fallbackIconColor = "grey-700"
}: {
  cardIcon?: IOLogoPaymentType;
  fallbackIconColor?: IOColors;
  size: IOIconSizeScale;
}) =>
  pipe(
    cardIcon,
    O.fromNullable,
    O.fold(
      // would be a cleaner solution to create an io-ts type and decode
      () => <Icon name="creditCard" size={size} color={fallbackIconColor} />,
      icon => <LogoPayment name={icon} size={size} />
    )
  );

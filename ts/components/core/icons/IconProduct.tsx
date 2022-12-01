import React from "react";
import { IOColors, IOColorType } from "../variables/IOColors";

/* Icons */
import IconProductPagoPA from "./svg/IconProductPagoPA";
import IconProductIOApp from "./svg/IconProductIOApp";

export const IOProductIcons = {
  ioApp: IconProductIOApp /* io-logo */,
  pagoPA: IconProductPagoPA /* io-pagopa */
} as const;

export type IOProductIconType = keyof typeof IOProductIcons;

type IOProductIconsProps = {
  name: IOProductIconType;
  color?: IOColorType;
  size?: number | "100%";
};

const IconProduct = ({
  name,
  color = "bluegrey",
  size = 56,
  ...props
}: IOProductIconsProps) => {
  const IconElement = IOProductIcons[name];
  return <IconElement {...props} size={size} color={IOColors[color]} />;
};

export default IconProduct;

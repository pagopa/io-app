import React from "react";
import { IOColors, IOColorType } from "../variables/IOColors";

/* Icons */
import IconNavMessages from "./svg/IconNavMessages";
import IconNavWallet from "./svg/IconNavWallet";
import IconNavDocuments from "./svg/IconNavDocuments";
import IconNavServices from "./svg/IconNavServices";
import IconNavProfile from "./svg/IconNavProfile";

export const IONavIcons = {
  messages: IconNavMessages /* io-messaggi */,
  wallet: IconNavWallet /* io-portafoglio */,
  documents: IconNavDocuments,
  services: IconNavServices,
  profile: IconNavProfile /* io-profilo */
} as const;

export type IONavIconType = keyof typeof IONavIcons;

type IONavIconsProps = {
  name: IONavIconType;
  color?: IOColorType;
  size?: number | "100%";
};

const IconNav = ({
  name,
  color = "bluegrey",
  size = 24,
  ...props
}: IONavIconsProps) => {
  const IconElement = IONavIcons[name];
  return (
    <IconElement {...props} size={size} style={{ color: IOColors[color] }} />
  );
};

export default IconNav;

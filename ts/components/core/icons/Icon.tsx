import React from "react";
import { ColorValue } from "react-native";
import { IOColors, IOColorType } from "../variables/IOColors";

import IconSpid from "./svg/IconSpid";
import IconCie from "./svg/IconCie";
import IconQrCode from "./svg/IconQrCode";
import IconQrCodeAlt from "./svg/IconQrCodeAlt";
import IconWebsite from "./svg/IconWebsite";
import IconHome from "./svg/IconHome";
import IconCopy from "./svg/IconCopy";
import IconSelfCertification from "./svg/IconSelfCertification";
import IconPEC from "./svg/IconPEC";
import IconDocument from "./svg/IconDocument";
import IconHourglass from "./svg/IconHourglass";
import IconShare from "./svg/IconShare";
import IconLocked from "./svg/IconLocked";
import IconUnlocked from "./svg/IconUnlocked";
import IconEyeShow from "./svg/IconEyeShow";
import IconEyeHide from "./svg/IconEyeHide";

export const IOIcons = {
  spid: IconSpid,
  cie: IconCie,
  qrCode: IconQrCode,
  qrCodeAlt: IconQrCodeAlt,
  website: IconWebsite,
  home: IconHome,
  copy: IconCopy,
  selfCert: IconSelfCertification,
  pec: IconPEC,
  document: IconDocument,
  hourglass: IconHourglass,
  share: IconShare,
  locked: IconLocked,
  unlocked: IconUnlocked,
  eyeShow: IconEyeShow,
  eyeHide: IconEyeHide
} as const;

export type IOIconType = keyof typeof IOIcons;

type IOIconsProps = {
  name: IOIconType;
  color?: IOColorType;
  size?: number | "100%";
};

export type SVGIconProps = {
  size: number | "100%";
  color: ColorValue;
};

const Icon = ({ name, color = "blue", size = 24, ...props }: IOIconsProps) => {
  const IconElement = IOIcons[name];
  return <IconElement {...props} size={size} color={IOColors[color]} />;
};

export default Icon;

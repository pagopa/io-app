import React from "react";
import { ColorValue } from "react-native";
import { IOColors, IOColorType } from "../variables/IOColors";

import IconApp from "./svg/IconApp";
import IconSpid from "./svg/IconSpid";
import IconCie from "./svg/IconCie";
import IconQrCode from "./svg/IconQrCode";
import IconQrCodeAlt from "./svg/IconQrCodeAlt";
import IconWebsite from "./svg/IconWebsite";
import IconHome from "./svg/IconHome";
import IconCopy from "./svg/IconCopy";
import IconSelfCertification from "./svg/IconSelfCertification";
import IconPEC from "./svg/IconPEC";
import IconHourglass from "./svg/IconHourglass";
import IconShare from "./svg/IconShare";
import IconLockOn from "./svg/IconLockOn";
import IconLockOff from "./svg/IconLockOff";
import IconEyeShow from "./svg/IconEyeShow";
import IconEyeHide from "./svg/IconEyeHide";
import IconPinOff from "./svg/IconPinOff";
import IconPinOn from "./svg/IconPinOn";
import IconSmileSad from "./svg/IconSmileSad";
import IconSmileHappy from "./svg/IconSmileHappy";
import IconTelephone from "./svg/IconTelephone";
import IconEmail from "./svg/IconEmail";
import IconMessage from "./svg/IconMessage";
import IconInstitution from "./svg/IconInstitution";
import IconDocument from "./svg/IconDocument";
import IconDocumentSign from "./svg/IconDocumentSign";
import IconChat from "./svg/IconChat";
import IconAgreement from "./svg/IconAgreement";
import IconAbacus from "./svg/IconAbacus";
import IconBarcode from "./svg/IconBarcode";
import IconDownload from "./svg/IconDownload";
import IconCompleted from "./svg/IconCompleted";
import IconSwitchOff from "./svg/IconSwitchOff";
import IconInitiatives from "./svg/IconInitiatives";
import IconAnalytics from "./svg/IconAnalytics";
import IconFornitori from "./svg/IconFornitori";
import IconCreditCard from "./svg/IconCreditCard";
import IconBonus from "./svg/IconBonus";
import IconTransactions from "./svg/IconTransactions";
import IconAmount from "./svg/IconAmount";
import IconPSP from "./svg/IconPSP";
import IconMagicWand from "./svg/IconMagicWand";
import IconEdit from "./svg/IconEdit";
import IconAdd from "./svg/IconAdd";
import IconAddAlt from "./svg/IconAddAlt";
import IconCoggle from "./svg/IconCoggle";
import IconLadybug from "./svg/IconLadybug";
import IconDotMenu from "./svg/IconDotMenu";
import IconWarning from "./svg/IconWarning";
import IconInfo from "./svg/IconInfo";
import IconOk from "./svg/IconOk";
import IconKo from "./svg/IconKo";
import IconReload from "./svg/IconReload";
import IconBattery from "./svg/IconBattery";
import IconTrashcan from "./svg/IconTrashcan";
import IconLocation from "./svg/IconLocation";

export const IOIcons = {
  app: IconApp,
  spid: IconSpid,
  cie: IconCie,
  qrCode: IconQrCode,
  qrCodeAlt: IconQrCodeAlt,
  website: IconWebsite,
  home: IconHome,
  copy: IconCopy,
  selfCert: IconSelfCertification,
  institution: IconInstitution,
  hourglass: IconHourglass,
  share: IconShare,
  locked: IconLockOn,
  unlocked: IconLockOff,
  eyeShow: IconEyeShow,
  eyeHide: IconEyeHide,
  pinOff: IconPinOff,
  pinOn: IconPinOn,
  smileSad: IconSmileSad,
  smileHappy: IconSmileHappy,
  telephone: IconTelephone,
  email: IconEmail,
  pec: IconPEC,
  abacus: IconAbacus,
  message: IconMessage,
  chat: IconChat,
  doc: IconDocument,
  docSign: IconDocumentSign,
  docAgree: IconAgreement,
  barcode: IconBarcode,
  download: IconDownload,
  completed: IconCompleted,
  switchOff: IconSwitchOff,
  initiatives: IconInitiatives,
  analytics: IconAnalytics,
  fornitori: IconFornitori,
  creditCard: IconCreditCard,
  bonus: IconBonus,
  transactions: IconTransactions,
  amount: IconAmount,
  psp: IconPSP,
  magicWand: IconMagicWand,
  edit: IconEdit,
  add: IconAdd,
  addAlt: IconAddAlt,
  coggle: IconCoggle,
  ladybug: IconLadybug,
  dotMenu: IconDotMenu,
  warning: IconWarning,
  info: IconInfo,
  ok: IconOk,
  ko: IconKo,
  reload: IconReload,
  battery: IconBattery,
  trashcan: IconTrashcan,
  location: IconLocation
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

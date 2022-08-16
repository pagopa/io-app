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
import IconLockOnAlt from "./svg/IconLockOnAlt";
import IconLockOn from "./svg/IconLockOn";
import IconLockOff from "./svg/IconLockOff";
import IconInitiatives from "./svg/IconInitiatives";
import IconAnalytics from "./svg/IconAnalytics";
import IconFornitori from "./svg/IconFornitori";
import IconEyeShow from "./svg/IconEyeShow";
import IconEyeHide from "./svg/IconEyeHide";
import IconPinOff from "./svg/IconPinOff";
import IconPinOn from "./svg/IconPinOn";
import IconSmileSad from "./svg/IconSmileSad";
import IconSmileHappy from "./svg/IconSmileHappy";
import IconPhone from "./svg/IconPhone";
import IconPhoneAlt from "./svg/IconPhoneAlt";
import IconEmail from "./svg/IconEmail";
import IconEnvelope from "./svg/IconEnvelope";
import IconMessage from "./svg/IconMessage";
import IconInstitution from "./svg/IconInstitution";
import IconDocument from "./svg/IconDocument";
import IconDocumentSign from "./svg/IconDocumentSign";
import IconGiacenza from "./svg/IconGiacenza";
import IconChat from "./svg/IconChat";
import IconAgreement from "./svg/IconAgreement";
import IconSave from "./svg/IconSave";
import IconCompleted from "./svg/IconCompleted";
import IconCompletedBig from "./svg/IconCompletedBig";
import IconSuccess from "./svg/IconSuccess";
import IconOk from "./svg/IconOk";
import IconCreditCard from "./svg/IconCreditCard";
import IconCreditCardAlt from "./svg/IconCreditCardAlt";
import IconBonus from "./svg/IconBonus";
import IconTransactions from "./svg/IconTransactions";
import IconAmount from "./svg/IconAmount";
import IconPSP from "./svg/IconPSP";
import IconAdd from "./svg/IconAdd";
import IconAddAlt from "./svg/IconAddAlt";
import IconCoggle from "./svg/IconCoggle";
import IconCoggleAlt from "./svg/IconCoggleAlt";
import IconWarning from "./svg/IconWarning";
import IconInfo from "./svg/IconInfo";
import IconNotice from "./svg/IconNotice";
import IconError from "./svg/IconError";
import IconReload from "./svg/IconReload";
import IconHistory from "./svg/IconHistory";
import IconEdit from "./svg/IconEdit";
import IconBattery from "./svg/IconBattery";
import IconTrashcan from "./svg/IconTrashcan";
import IconTrashcanAlt from "./svg/IconTrashcanAlt";
import IconLocation from "./svg/IconLocation";
import IconCalendar from "./svg/IconCalendar";
import IconCalendarAlt from "./svg/IconCalendarAlt";
import IconProfileExperiment from "./svg/IconProfileExperiment";
import IconMagicWand from "./svg/IconMagicWand";
import IconProfile from "./svg/IconProfile";
import IconProfileAlt from "./svg/IconProfileAlt";
import IconStarFilled from "./svg/IconStarFilled";
import IconStarEmpty from "./svg/IconStarEmpty";
import IconAbacus from "./svg/IconAbacus";
import IconSwitchOff from "./svg/IconSwitchOff";
import IconDotMenu from "./svg/IconDotMenu";
import IconBarcode from "./svg/IconBarcode";
import IconLogin from "./svg/IconLogin";
import IconLadybug from "./svg/IconLadybug";
import IconTag from "./svg/IconTag";
import IconGallery from "./svg/IconGallery";
import IconCancel from "./svg/IconCancel";
import IconQuestion from "./svg/IconQuestion";
import IconSearch from "./svg/IconSearch";
import IconArrowRight from "./svg/IconArrowRight";
import IconArrowLeft from "./svg/IconArrowLeft";
import IconArrowDown from "./svg/IconArrowDown";
import IconArrowUp from "./svg/IconArrowUp";
import IconClose from "./svg/IconClose";
import IconCloseSmall from "./svg/IconCloseSmall";

export const IOIcons = {
  app: IconApp /* io-logo */,
  spid: IconSpid,
  cie: IconCie /* io-cie */,
  qrCode: IconQrCode /* io-qr */,
  qrCodeAlt: IconQrCodeAlt,
  website: IconWebsite,
  home: IconHome,
  copy: IconCopy /* io-copy */,
  selfCert: IconSelfCertification,
  institution: IconInstitution,
  hourglass: IconHourglass /* io-hourglass */,
  share: IconShare /* io-share */,
  lockedAlt: IconLockOnAlt /* io-lucchetto */,
  locked: IconLockOn /* io-locker-closed */,
  unlocked: IconLockOff /* io-locker-open */,
  initiatives: IconInitiatives,
  analytics: IconAnalytics,
  fornitori: IconFornitori,
  eyeShow: IconEyeShow,
  eyeHide: IconEyeHide,
  pinOff: IconPinOff,
  pinOn: IconPinOn,
  smileSad: IconSmileSad /* io-sad */,
  smileHappy: IconSmileHappy /* io-happy */,
  phone: IconPhone,
  phoneAlt: IconPhoneAlt /* io-phone */,
  email: IconEmail,
  envelope: IconEnvelope /* io-envelope */,
  pec: IconPEC,
  message: IconMessage /* io-send-message */,
  chat: IconChat,
  doc: IconDocument,
  docSign: IconDocumentSign,
  docAgree: IconAgreement,
  docGiacenza: IconGiacenza,
  save: IconSave /* io-save */,
  completed: IconCompleted,
  completedBig: IconCompletedBig /* io-tick-big */,
  success: IconSuccess /* io-success */,
  ok: IconOk /* io-complete */,
  creditCard: IconCreditCard,
  creditCardAlt: IconCreditCardAlt /* io-carta */,
  bonus: IconBonus,
  transactions: IconTransactions /* io-transactions */,
  amount: IconAmount,
  psp: IconPSP,
  add: IconAdd /* io-plus */,
  addAlt: IconAddAlt,
  coggle: IconCoggle /* io-coggle */,
  coggleAlt: IconCoggleAlt /* Io-preferenze */,
  warning: IconWarning /* io-warning */,
  notice: IconNotice /* io-notice */,
  info: IconInfo /* io-info */,
  error: IconError /* io-error */,
  reload: IconReload /* io-reload */,
  history: IconHistory,
  edit: IconEdit /* io-edit */,
  battery: IconBattery,
  trashcan: IconTrashcan,
  trashcanAlt: IconTrashcanAlt /* io-trash */,
  location: IconLocation,
  calendar: IconCalendar /* io-calendar */,
  calendarAlt: IconCalendarAlt /* io-calendario */,
  profile: IconProfile,
  profileAlt: IconProfileAlt /* io-titolare */,
  profileExperiment: IconProfileExperiment /* io-profilo-exp */,
  starFilled: IconStarFilled /* io-filled-star */,
  starEmpty: IconStarEmpty /* io-empty-star */,
  magicWand: IconMagicWand,
  abacus: IconAbacus /* io-abacus */,
  switchOff: IconSwitchOff,
  dotMenu: IconDotMenu /* io-more */,
  barcode: IconBarcode,
  login: IconLogin,
  ladybug: IconLadybug,
  tag: IconTag,
  gallery: IconGallery,
  cancel: IconCancel /* io-cancel */,
  help: IconQuestion /* io-question */,
  search: IconSearch /* io-search */,
  arrowRight: IconArrowRight /* io-right */,
  arrowLeft: IconArrowLeft /* io-back */,
  arrowDown: IconArrowDown,
  arrowUp: IconArrowUp,
  close: IconClose /* io-close */,
  closeSmall: IconCloseSmall
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

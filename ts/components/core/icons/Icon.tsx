import React from "react";
import { ColorValue, StyleProp } from "react-native";
import { IOColors } from "../variables/IOColors";

/* Icons */
import IconSpid from "./svg/IconSpid";
import IconCie from "./svg/IconCie";
import IconQrCode from "./svg/IconQrCode";
import IconHome from "./svg/IconHome";
import IconHomeFill from "./svg/IconHomeFill";
import IconCopy from "./svg/IconCopy";
import IconSelfCertification from "./svg/IconSelfCertification";
import IconInstitution from "./svg/IconInstitution";
import IconHourglass from "./svg/IconHourglass";
import IconPEC from "./svg/IconPEC";
import IconMessageLegal from "./svg/IconMessageLegal";
import IconShareiOs from "./svg/IconShareiOs";
import IconShareAndroid from "./svg/IconShareAndroid";
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
import IconCurrencyEuro from "./svg/IconCurrencyEuro";
import IconAmount from "./svg/IconAmount";
import IconPSP from "./svg/IconPSP";
import IconAdd from "./svg/IconAdd";
import IconAddAlt from "./svg/IconAddAlt";
import IconCoggle from "./svg/IconCoggle";
import IconCoggleAlt from "./svg/IconCoggleAlt";
import IconWarning from "./svg/IconWarning";
import IconInfo from "./svg/IconInfo";
import IconInfoFilled from "./svg/IconInfoFilled";
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
import LegIconAbacus from "./svg/LegIconAbacus";
import IconSwitchOff from "./svg/IconSwitchOff";
import IconDeviceSignal from "./svg/IconDeviceSignal";
import IconDotMenu from "./svg/IconDotMenu";
import IconBarcode from "./svg/IconBarcode";
import IconLogin from "./svg/IconLogin";
import IconLadybug from "./svg/IconLadybug";
import IconTag from "./svg/IconTag";
import IconGallery from "./svg/IconGallery";
import IconCancel from "./svg/IconCancel";
import IconQuestion from "./svg/IconQuestion";
import IconSearch from "./svg/IconSearch";
import IconClose from "./svg/IconClose";
import IconCloseSmall from "./svg/IconCloseSmall";
import IconEmailLegal from "./svg/IconEmailLegal";
import IconDocumentAttachment from "./svg/IconDocumentAttachment";
import IconDocumentAttachmentPDF from "./svg/IconDocumentAttachmentPDF";
import IconAttachment from "./svg/IconAttachment";
import IconExternalLink from "./svg/IconExternalLink";
import IconUnknownGdo from "./svg/IconUnknownGdo";
import IconArrowCircleUp from "./svg/IconArrowCircleUp";
import IconWarningFilled from "./svg/IconWarningFilled";
import IconErrorFilled from "./svg/IconErrorFilled";
import IconChevronRight from "./svg/IconChevronRight";
import IconChevronTop from "./svg/IconChevronTop";
import IconChevronBottom from "./svg/IconChevronBottom";
import IconChevronLeft from "./svg/IconChevronLeft";
import IconArrowBottom from "./svg/IconArrowBottom";
import IconArrowLeft from "./svg/IconArrowLeft";
import IconArrowTop from "./svg/IconArrowTop";
import IconArrowRight from "./svg/IconArrowRight";
import IconNavMessages from "./svg/IconNavMessages";
import IconNavWallet from "./svg/IconNavWallet";
import IconNavDocuments from "./svg/IconNavDocuments";
import IconNavServices from "./svg/IconNavServices";
import IconNavProfile from "./svg/IconNavProfile";
import IconBiomFingerprint from "./svg/IconBiomFingerprint";
import IconBiomFaceID from "./svg/IconBiomFaceID";
import IconCategCulture from "./svg/IconCategCulture";
import IconCategWellness from "./svg/IconCategWellness";
import IconCategLearning from "./svg/IconCategLearning";
import IconCategSport from "./svg/IconCategSport";
import IconCategHome from "./svg/IconCategHome";
import IconCategTelco from "./svg/IconCategTelco";
import IconCategFinance from "./svg/IconCategFinance";
import IconCategTravel from "./svg/IconCategTravel";
import IconCategMobility from "./svg/IconCategMobility";
import IconCategJobOffers from "./svg/IconCategJobOffers";
import IconCategShopping from "./svg/IconCategShopping";
import IconCategSustainability from "./svg/IconCategSustainability";
import IconProductIOApp from "./svg/IconProductIOApp";
import IconProductPagoPA from "./svg/IconProductPagoPA";
import IconWebsite from "./svg/IconWebsite";
import LegIconQrCode from "./svg/LegIconQrCode";
import LegIconWebsite from "./svg/LegIconWebsite";
import LegIconHome from "./svg/LegIconHome";
import LegIconCopy from "./svg/LegIconCopy";
import LegIconInstitution from "./svg/LegIconInstitution";
import LegIconHourglass from "./svg/LegIconHourglass";
import LegIconShare from "./svg/LegIconShare";
import LegIconLockOn from "./svg/LegIconLockOn";
import LegIconLockOff from "./svg/LegIconLockOff";

export const IOIcons = {
  spid: IconSpid,
  cie: IconCie /* io-cie */,
  qrCode: IconQrCode,
  legQrCode: LegIconQrCode /* io-qr */,
  website: IconWebsite,
  legWebsite: LegIconWebsite,
  abacus: IconAbacus,
  legAbacus: LegIconAbacus /* io-abacus */,
  home: IconHome,
  homeFill: IconHomeFill,
  legHome: LegIconHome,
  copy: IconCopy,
  legCopy: LegIconCopy /* io-copy */,
  selfCert: IconSelfCertification,
  institution: IconInstitution,
  legInstitution: LegIconInstitution,
  hourglass: IconHourglass,
  legHourglass: LegIconHourglass /* io-hourglass */,
  shareiOs: IconShareiOs,
  shareAndroid: IconShareAndroid,
  legShare: LegIconShare /* io-share */,
  locked: IconLockOn,
  unlocked: IconLockOff,
  legLocked: LegIconLockOn /* io-locker-closed */ /* io-lucchetto */,
  legUnlocked: LegIconLockOff /* io-locker-open */,
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
  emailLegal: IconEmailLegal,
  messageLegal: IconMessageLegal,
  message: IconMessage /* io-send-message */,
  chat: IconChat,
  doc: IconDocument,
  docSign: IconDocumentSign,
  docAgree: IconAgreement,
  docGiacenza: IconGiacenza,
  docAttach: IconDocumentAttachment,
  docAttachPDF: IconDocumentAttachmentPDF,
  attachment: IconAttachment,
  add: IconAdd /* io-plus */,
  addAlt: IconAddAlt,
  completed: IconCompleted,
  completedBig: IconCompletedBig /* io-tick-big */,
  success: IconSuccess /* io-success */,
  ok: IconOk /* io-complete */,
  creditCard: IconCreditCard,
  creditCardAlt: IconCreditCardAlt /* io-carta */,
  bonus: IconBonus,
  transactions: IconTransactions /* io-transactions */,
  currencyEuro: IconCurrencyEuro,
  amount: IconAmount,
  psp: IconPSP,
  location: IconLocation,
  coggle: IconCoggle /* io-coggle */,
  coggleAlt: IconCoggleAlt /* io-preferenze */,
  warning: IconWarning /* io-warning */,
  warningFilled: IconWarningFilled,
  notice: IconNotice /* io-notice */,
  info: IconInfo /* io-info */,
  infoFilled: IconInfoFilled,
  error: IconError /* io-error */,
  errorFilled: IconErrorFilled,
  reload: IconReload /* io-reload */,
  history: IconHistory,
  edit: IconEdit /* io-edit */,
  battery: IconBattery,
  trashcan: IconTrashcan,
  trashcanAlt: IconTrashcanAlt /* io-trash */,
  calendar: IconCalendar /* io-calendar */,
  calendarAlt: IconCalendarAlt /* io-calendario */,
  profile: IconProfile,
  profileAlt: IconProfileAlt /* io-titolare */,
  profileExperiment: IconProfileExperiment /* io-profilo-exp */,
  magicWand: IconMagicWand,
  starFilled: IconStarFilled /* io-filled-star */,
  starEmpty: IconStarEmpty /* io-empty-star */,
  switchOff: IconSwitchOff,
  deviceSignal: IconDeviceSignal,
  dotMenu: IconDotMenu /* io-more */,
  barcode: IconBarcode,
  save: IconSave /* io-save */,
  login: IconLogin,
  ladybug: IconLadybug,
  tag: IconTag,
  gallery: IconGallery,
  externalLink: IconExternalLink,
  unknownGdo: IconUnknownGdo,
  cancel: IconCancel /* io-cancel */,
  help: IconQuestion /* io-question */,
  search: IconSearch /* io-search */,
  chevronRight: IconChevronRight /* io-right */,
  chevronLeft: IconChevronLeft /* io-back */,
  chevronBottom: IconChevronBottom,
  chevronTop: IconChevronTop,
  close: IconClose /* io-close */,
  closeSmall: IconCloseSmall,
  arrowBottom: IconArrowBottom,
  arrowLeft: IconArrowLeft,
  arrowTop: IconArrowTop,
  arrowRight: IconArrowRight,
  arrowCircleUp: IconArrowCircleUp,
  navMessages: IconNavMessages /* io-messaggi */,
  navWallet: IconNavWallet /* io-portafoglio */,
  navDocuments: IconNavDocuments,
  navServices: IconNavServices,
  navProfile: IconNavProfile /* io-profilo */,
  biomFingerprint: IconBiomFingerprint /* io-fingerprint */,
  biomFaceID: IconBiomFaceID /* io-face-id */,
  categCulture: IconCategCulture,
  categWellness: IconCategWellness,
  categLearning: IconCategLearning,
  categSport: IconCategSport,
  categHome: IconCategHome,
  categTelco: IconCategTelco,
  categFinance: IconCategFinance,
  categTravel: IconCategTravel,
  categMobility: IconCategMobility,
  categJobOffers: IconCategJobOffers,
  categShopping: IconCategShopping,
  categSustainability: IconCategSustainability,
  productIOApp: IconProductIOApp /* io-logo */,
  productPagoPA: IconProductPagoPA /* io-pagopa */
} as const;

export type IOIcons = keyof typeof IOIcons;

export type IOIconsProps = {
  name: IOIcons;
  color?: IOColors;
  size?: number | "100%";
};

export type SVGIconProps = {
  size: number | "100%";
  style: StyleProp<any>;
};

/*
Static icon component. Use it when you need an ion that doesn't
change its color values. It accepts `IOColors` values only.
*/
export const Icon = ({
  name,
  color = "bluegrey",
  size = 24,
  ...props
}: IOIconsProps) => {
  const IconElement = IOIcons[name];
  return (
    <IconElement {...props} style={{ color: IOColors[color] }} size={size} />
  );
};

/*
Animated icon component. Use it when you need a color
transition between different states.
*/

type IOAnimatedIconsProps = {
  name: IOIcons;
  color?: ColorValue;
  size?: number | "100%";
};

export const AnimatedIcon = ({
  name,
  color = IOColors.bluegrey,
  size = 24,
  ...props
}: IOAnimatedIconsProps) => {
  const IconElement = IOIcons[name];
  return <IconElement {...props} style={{ color }} size={size} />;
};

/* Make <Icon> component animatable. Reanimated supports class components only,
so we need to convert <Icon> into a class component first.
https://github.com/software-mansion/react-native-reanimated/discussions/1527  */
export class IconClassComponent extends React.Component<IOAnimatedIconsProps> {
  constructor(props: IOAnimatedIconsProps) {
    super(props);
  }
  render() {
    return <AnimatedIcon {...this.props} />;
  }
}

/*
░░░ VARIOUS SETS ░░░
*/

/* New icons */
const {
  qrCode,
  website,
  abacus,
  home,
  homeFill,
  copy,
  institution,
  hourglass,
  shareiOs,
  shareAndroid,
  locked,
  unlocked,
  success,
  errorFilled,
  warningFilled,
  info,
  infoFilled,
  arrowBottom,
  arrowLeft,
  arrowTop,
  arrowRight,
  arrowCircleUp
} = IOIcons;

export const IOIconsNew = {
  qrCode,
  website,
  abacus,
  home,
  homeFill,
  copy,
  institution,
  hourglass,
  shareiOs,
  shareAndroid,
  locked,
  unlocked,
  success,
  errorFilled,
  warningFilled,
  infoFilled,
  info,
  arrowBottom,
  arrowLeft,
  arrowTop,
  arrowRight,
  arrowCircleUp
};

/* Navigation */
const { navMessages, navWallet, navDocuments, navServices, navProfile } =
  IOIcons;

export const IONavIcons = {
  navMessages,
  navWallet,
  navDocuments,
  navServices,
  navProfile
} as const;

export type IONavIcons = keyof typeof IONavIcons;

/* Biometric */
const { biomFingerprint, biomFaceID } = IOIcons;

export const IOBiometricIcons = {
  biomFingerprint,
  biomFaceID
} as const;

export type IOBiometricIcons = keyof typeof IOBiometricIcons;

/* Categories (used by CGN) */
const {
  categCulture,
  categWellness,
  categLearning,
  categSport,
  categHome,
  categTelco,
  categFinance,
  categTravel,
  categMobility,
  categJobOffers,
  categShopping,
  categSustainability
} = IOIcons;

export const IOCategoryIcons = {
  categCulture,
  categWellness,
  categLearning,
  categSport,
  categHome,
  categTelco,
  categFinance,
  categTravel,
  categMobility,
  categJobOffers,
  categShopping,
  categSustainability
} as const;

export type IOCategoryIcons = keyof typeof IOCategoryIcons;

/* Product Logos */
const { productIOApp, productPagoPA } = IOIcons;

export const IOProductIcons = {
  productIOApp,
  productPagoPA
} as const;

export type IOProductIcons = keyof typeof IOProductIcons;

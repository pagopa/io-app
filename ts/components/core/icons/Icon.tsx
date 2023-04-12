import React from "react";
import { ColorValue, StyleProp } from "react-native";
import { IOColors } from "../variables/IOColors";

/* Icons */
import IconSpid from "./svg/IconSpid";
import IconCie from "./svg/IconCie";
import IconQrCode from "./svg/IconQrCode";
import IconBell from "./svg/IconBell";
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
import IconEmojiSad from "./svg/IconEmojiSad";
import IconEmojiHappy from "./svg/IconEmojiHappy";
import IconPhone from "./svg/IconPhone";
import IconEmail from "./svg/IconEmail";
import IconMessage from "./svg/IconMessage";
import IconDocument from "./svg/IconDocument";
import IconDocumentSign from "./svg/IconDocumentSign";
import IconGiacenza from "./svg/IconGiacenza";
import IconChat from "./svg/IconChat";
import IconAgreement from "./svg/IconAgreement";
import IconSave from "./svg/IconSave";
import IconCompleted from "./svg/IconCompleted";
import IconSuccess from "./svg/IconSuccess";
import IconOk from "./svg/IconOk";
import IconFiscalCodeIndividual from "./svg/IconFiscalCodeIndividual";
import IconCreditCard from "./svg/IconCreditCard";
import IconBonus from "./svg/IconBonus";
import IconTransactions from "./svg/IconTransactions";
import IconAmount from "./svg/IconAmount";
import IconPSP from "./svg/IconPSP";
import IconAdd from "./svg/IconAdd";
import IconCoggle from "./svg/IconCoggle";
import IconInfo from "./svg/IconInfo";
import IconInfoFilled from "./svg/IconInfoFilled";
import IconNotice from "./svg/IconNotice";
import IconNoticeFilled from "./svg/IconNoticeFilled";
import IconRefund from "./svg/IconRefund";
import IconReload from "./svg/IconReload";
import IconHistory from "./svg/IconHistory";
import IconEdit from "./svg/IconEdit";
import IconBattery from "./svg/IconBattery";
import IconTrashcan from "./svg/IconTrashcan";
import IconCalendar from "./svg/IconCalendar";
import IconProfileExperiment from "./svg/IconProfileExperiment";
import IconMagicWand from "./svg/IconMagicWand";
import IconProfile from "./svg/IconProfile";
import IconProfileFilled from "./svg/IconProfileFilled";
import IconProfileAlt from "./svg/IconProfileAlt";
import IconStarFilled from "./svg/IconStarFilled";
import IconStarEmpty from "./svg/IconStarEmpty";
import IconAbacus from "./svg/IconAbacus";
import LegIconAbacus from "./svg/LegIconAbacus";
import IconSwitchOff from "./svg/IconSwitchOff";
import IconDevice from "./svg/IconDevice";
import IconDotMenu from "./svg/IconDotMenu";
import IconBarcode from "./svg/IconBarcode";
import IconLogin from "./svg/IconLogin";
import IconLogout from "./svg/IconLogout";
import IconLadybug from "./svg/IconLadybug";
import IconTag from "./svg/IconTag";
import IconGallery from "./svg/IconGallery";
import IconCancel from "./svg/IconCancel";
import IconQuestion from "./svg/IconQuestion";
import IconSearch from "./svg/IconSearch";
import IconClose from "./svg/IconClose";
import IconCloseSmall from "./svg/IconCloseSmall";
import IconDocumentAttachment from "./svg/IconDocumentAttachment";
import IconDocumentAttachmentPDF from "./svg/IconDocumentAttachmentPDF";
import IconAttachment from "./svg/IconAttachment";
import IconLocationiOS from "./svg/IconLocationiOS";
import IconLocationiOSFilled from "./svg/IconLocationiOSFilled";
import IconLocationAndroid from "./svg/IconLocationAndroid";
import IconExternalLink from "./svg/IconExternalLink";
import IconUnknownGdo from "./svg/IconUnknownGdo";
import IconWarningFilled from "./svg/IconWarningFilled";
import IconCanceled from "./svg/IconCanceled";
import IconErrorFilled from "./svg/IconErrorFilled";
import IconChevronRight from "./svg/IconChevronRight";
import IconChevronTop from "./svg/IconChevronTop";
import IconChevronBottom from "./svg/IconChevronBottom";
import IconChevronLeft from "./svg/IconChevronLeft";
import IconChevronRightListItem from "./svg/IconChevronRightListItem";
import IconArrowBottom from "./svg/IconArrowBottom";
import IconArrowLeft from "./svg/IconArrowLeft";
import IconArrowTop from "./svg/IconArrowTop";
import IconArrowRight from "./svg/IconArrowRight";
import IconBackiOS from "./svg/IconBackiOS";
import IconBackAndroid from "./svg/IconBackAndroid";
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
import IconSecurity from "./svg/IconSecurity";
import LegIconQrCode from "./svg/LegIconQrCode";
import LegIconWebsite from "./svg/LegIconWebsite";
import LegIconHome from "./svg/LegIconHome";
import LegIconCopy from "./svg/LegIconCopy";
import LegIconInstitution from "./svg/LegIconInstitution";
import LegIconHourglass from "./svg/LegIconHourglass";
import LegIconShare from "./svg/LegIconShare";
import LegIconLockOn from "./svg/LegIconLockOn";
import LegIconLockOff from "./svg/LegIconLockOff";
import LegIconInitiatives from "./svg/LegIconInitiatives";
import LegIconAnalytics from "./svg/LegIconAnalytics";
import LegIconFornitori from "./svg/LegIconFornitori";
import LegIconEyeShow from "./svg/LegIconEyeShow";
import LegIconEyeHide from "./svg/LegIconEyeHide";
import LegIconPinOff from "./svg/LegIconPinOff";
import LegIconPinOn from "./svg/LegIconPinOn";
import LegIconEmojiSad from "./svg/LegIconEmojiSad";
import LegIconEmojiHappy from "./svg/LegIconEmojiHappy";
import LegIconPhone from "./svg/LegIconPhone";
import LegIconEmail from "./svg/LegIconEmail";
import IconEmailFill from "./svg/IconEmailFill";
import LegIconPEC from "./svg/LegIconPEC";
import LegIconMessageLegal from "./svg/LegIconMessageLegal";
import LegIconMessage from "./svg/LegIconMessage";
import LegIconChat from "./svg/LegIconChat";
import LegIconDocumentAttachmentPDF from "./svg/LegIconDocumentAttachmentPDF";
import LegIconAttachment from "./svg/LegIconAttachment";
import LegIconAdd from "./svg/LegIconAdd";
import LegIconCompleted from "./svg/LegIconCompleted";
import LegIconCreditCard from "./svg/LegIconCreditCard";
import LegIconBonus from "./svg/LegIconBonus";
import LegIconDocumentAttachment from "./svg/LegIconDocumentAttachment";
import LegIconAmount from "./svg/LegIconAmount";
import LegIconCoggle from "./svg/LegIconCoggle";
import LegIconLocation from "./svg/LegIconLocation";
import LegIconWarning from "./svg/LegIconWarning";
import LegIconNotice from "./svg/LegIconNotice";
import LegIconHistory from "./svg/LegIconHistory";
import LegIconEdit from "./svg/LegIconEdit";
import LegIconBattery from "./svg/LegIconBattery";
import LegIconTrashcan from "./svg/LegIconTrashcan";
import LegIconCalendar from "./svg/LegIconCalendar";
import LegIconProfile from "./svg/LegIconProfile";
import LegIconProfileExperiment from "./svg/LegIconProfileExperiment";
import LegIconMagicWand from "./svg/LegIconMagicWand";
import LegIconStarFilled from "./svg/LegIconStarFilled";
import LegIconStarEmpty from "./svg/LegIconStarEmpty";
import LegIconSwitchOff from "./svg/LegIconSwitchOff";
import LegIconDotMenu from "./svg/LegIconDotMenu";
import LegIconBarcode from "./svg/LegIconBarcode";
import LegIconSave from "./svg/LegIconSave";
import LegIconLogin from "./svg/LegIconLogin";
import LegIconLadybug from "./svg/LegIconLadybug";
import LegIconTag from "./svg/LegIconTag";
import LegIconGallery from "./svg/LegIconGallery";
import LegIconExternalLink from "./svg/LegIconExternalLink";
import LegIconUnknownGdo from "./svg/LegIconUnknownGdo";
import LegIconCancel from "./svg/LegIconCancel";
import LegIconDevice from "./svg/LegIconDevice";
import LegIconQuestion from "./svg/LegIconQuestion";
import LegIconSearch from "./svg/LegIconSearch";
import LegIconClose from "./svg/LegIconClose";
import LegIconCloseSmall from "./svg/LegIconCloseSmall";
import LegIconChevronLeft from "./svg/LegIconChevronLeft";
import LegIconGiacenza from "./svg/LegIconGiacenza";
import LegIconPSP from "./svg/LegIconPSP";
import LegIconError from "./svg/LegIconError";
import LegIconRadioOn from "./svg/LegIconRadioOn";
import LegIconRadioOff from "./svg/LegIconRadioOff";
import LegIconCheckOn from "./svg/LegIconCheckOn";
import LegIconCheckOff from "./svg/LegIconCheckOff";

export const IOIcons = {
  spid: IconSpid,
  cie: IconCie /* io-cie */,
  qrCode: IconQrCode,
  legQrCode: LegIconQrCode,
  bell: IconBell,
  website: IconWebsite,
  legWebsite: LegIconWebsite,
  abacus: IconAbacus,
  legAbacus: LegIconAbacus,
  home: IconHome,
  homeFill: IconHomeFill,
  legHome: LegIconHome,
  copy: IconCopy,
  legCopy: LegIconCopy,
  selfCert: IconSelfCertification,
  institution: IconInstitution,
  legInstitution: LegIconInstitution,
  hourglass: IconHourglass,
  legHourglass: LegIconHourglass,
  shareiOs: IconShareiOs,
  shareAndroid: IconShareAndroid,
  legShare: LegIconShare,
  locked: IconLockOn,
  unlocked: IconLockOff,
  legLocked: LegIconLockOn /* io-lucchetto */,
  legUnlocked: LegIconLockOff,
  initiatives: IconInitiatives,
  legInitiatives: LegIconInitiatives,
  analytics: IconAnalytics,
  legAnalytics: LegIconAnalytics,
  fornitori: IconFornitori,
  legFornitori: LegIconFornitori,
  eyeShow: IconEyeShow,
  eyeHide: IconEyeHide,
  legEyeShow: LegIconEyeShow,
  legEyeHide: LegIconEyeHide,
  pinOff: IconPinOff,
  pinOn: IconPinOn,
  legPinOff: LegIconPinOff,
  legPinOn: LegIconPinOn,
  emojiSad: IconEmojiSad,
  emojiHappy: IconEmojiHappy,
  legEmojiSad: LegIconEmojiSad,
  legEmojiHappy: LegIconEmojiHappy,
  phone: IconPhone,
  legPhone: LegIconPhone /* io-phone */,
  email: IconEmail,
  emailFill: IconEmailFill,
  legEmail: LegIconEmail /* io-envelope */,
  pec: IconPEC,
  legPec: LegIconPEC,
  messageLegal: IconMessageLegal,
  legMessageLegal: LegIconMessageLegal,
  message: IconMessage,
  legMessage: LegIconMessage,
  chat: IconChat,
  legChat: LegIconChat,
  doc: IconDocument,
  docSign: IconDocumentSign,
  docAgree: IconAgreement,
  security: IconSecurity,
  docGiacenza: IconGiacenza,
  legDocGiacenza: LegIconGiacenza,
  docAttach: IconDocumentAttachment,
  docAttachPDF: IconDocumentAttachmentPDF,
  legDocAttach: LegIconDocumentAttachment,
  legDocAttachPDF: LegIconDocumentAttachmentPDF,
  attachment: IconAttachment,
  legAttachment: LegIconAttachment,
  add: IconAdd,
  legAdd: LegIconAdd,
  completed: IconCompleted,
  legCompleted: LegIconCompleted /* io-tick-big */,
  success: IconSuccess,
  ok: IconOk,
  fiscalCodeIndividual: IconFiscalCodeIndividual,
  creditCard: IconCreditCard,
  legCreditCard: LegIconCreditCard /* io-carta */,
  bonus: IconBonus,
  legBonus: LegIconBonus,
  transactions: IconTransactions,
  amount: IconAmount,
  legAmount: LegIconAmount,
  psp: IconPSP,
  legPsp: LegIconPSP,
  locationiOS: IconLocationiOS,
  locationiOSFilled: IconLocationiOSFilled,
  locationAndroid: IconLocationAndroid,
  legLocation: LegIconLocation,
  coggle: IconCoggle,
  legCoggle: LegIconCoggle,
  warningFilled: IconWarningFilled,
  legWarning: LegIconWarning /* io-warning */,
  notice: IconNotice,
  noticeFilled: IconNoticeFilled,
  legNotice: LegIconNotice,
  info: IconInfo,
  infoFilled: IconInfoFilled,
  canceled: IconCanceled,
  legError: LegIconError,
  errorFilled: IconErrorFilled,
  refund: IconRefund,
  reload: IconReload,
  history: IconHistory,
  legHistory: LegIconHistory,
  edit: IconEdit,
  legEdit: LegIconEdit,
  battery: IconBattery,
  legBattery: LegIconBattery,
  trashcan: IconTrashcan,
  legTrashcan: LegIconTrashcan,
  calendar: IconCalendar,
  legCalendar: LegIconCalendar /* io-calendar */ /* io-calendario */,
  profile: IconProfile,
  profileFilled: IconProfileFilled,
  profileAlt: IconProfileAlt /* io-titolare */,
  legProfile: LegIconProfile,
  profileExperiment: IconProfileExperiment,
  legProfileExperiment: LegIconProfileExperiment,
  magicWand: IconMagicWand,
  legMagicWand: LegIconMagicWand,
  starFilled: IconStarFilled,
  starEmpty: IconStarEmpty,
  legStarFilled: LegIconStarFilled,
  legStarEmpty: LegIconStarEmpty,
  switchOff: IconSwitchOff,
  legSwitchOff: LegIconSwitchOff,
  device: IconDevice,
  legDevice: LegIconDevice,
  dotMenu: IconDotMenu,
  legDotMenu: LegIconDotMenu,
  barcode: IconBarcode,
  legBarcode: LegIconBarcode,
  save: IconSave,
  legSave: LegIconSave,
  login: IconLogin,
  logout: IconLogout,
  legLogin: LegIconLogin,
  ladybug: IconLadybug,
  legLadybug: LegIconLadybug,
  tag: IconTag,
  legTag: LegIconTag,
  gallery: IconGallery,
  legGallery: LegIconGallery,
  externalLink: IconExternalLink,
  legExternalLink: LegIconExternalLink,
  unknownGdo: IconUnknownGdo,
  legUnknownGdo: LegIconUnknownGdo,
  cancel: IconCancel,
  legCancel: LegIconCancel /* io-cancel */,
  help: IconQuestion,
  legHelp: LegIconQuestion /* io-question */,
  search: IconSearch /* io-search */,
  legSearch: LegIconSearch /* io-search */,
  chevronRight: IconChevronRight /* io-right */,
  chevronLeft: IconChevronLeft,
  chevronBottom: IconChevronBottom,
  chevronTop: IconChevronTop,
  chevronRightListItem: IconChevronRightListItem,
  legChevronLeft: LegIconChevronLeft,
  close: IconClose,
  legClose: LegIconClose /* io-close */,
  closeSmall: IconCloseSmall,
  legCloseSmall: LegIconCloseSmall,
  arrowBottom: IconArrowBottom,
  arrowLeft: IconArrowLeft,
  arrowTop: IconArrowTop,
  arrowRight: IconArrowRight,
  backiOS: IconBackiOS,
  backAndroid: IconBackAndroid,
  legIconRadioOn: LegIconRadioOn,
  legIconRadioOff: LegIconRadioOff,
  legIconCheckOn: LegIconCheckOn,
  legIconCheckOff: LegIconCheckOff,
  navMessages: IconNavMessages,
  navWallet: IconNavWallet,
  navDocuments: IconNavDocuments,
  navServices: IconNavServices,
  navProfile: IconNavProfile,
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
  productIOApp: IconProductIOApp,
  productPagoPA: IconProductPagoPA /* io-pagopa */
} as const;

export type IOIcons = keyof typeof IOIcons;

export type IOIconsProps = {
  name: IOIcons;
  color?: IOColors;
  size?: number | "100%";
  testID?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
};

export type SVGIconProps = {
  size: number | "100%";
  style: StyleProp<any>;
  accessible: boolean;
  accessibilityElementsHidden: boolean;
  accessibilityLabel: string;
  importantForAccessibility: string;
};

/*
Static icon component. Use it when you need an ion that doesn't
change its color values. It accepts `IOColors` values only.
*/
export const Icon = ({
  name,
  color = "bluegrey",
  size = 24,
  accessible = false,
  accessibilityLabel = "",
  ...props
}: IOIconsProps) => {
  const IconElement = IOIcons[name];
  return (
    <IconElement
      {...props}
      style={{ color: IOColors[color] }}
      size={size}
      accessible={accessible}
      accessibilityElementsHidden={true}
      accessibilityLabel={accessibilityLabel}
      importantForAccessibility={"no-hide-descendants"}
    />
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
  accessible?: boolean;
};

export const AnimatedIcon = ({
  name,
  color = IOColors.bluegrey,
  size = 24,
  accessible = false,
  ...props
}: IOAnimatedIconsProps) => {
  const IconElement = IOIcons[name];
  return (
    <IconElement
      {...props}
      style={{ color }}
      size={size}
      accessible={accessible}
      accessibilityElementsHidden={true}
      accessibilityLabel={""}
      importantForAccessibility={"no-hide-descendants"}
    />
  );
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
  bell,
  home,
  homeFill,
  copy,
  institution,
  hourglass,
  shareiOs,
  shareAndroid,
  locked,
  unlocked,
  initiatives,
  analytics,
  fornitori,
  eyeShow,
  eyeHide,
  pinOff,
  pinOn,
  emojiSad,
  emojiHappy,
  phone,
  email,
  emailFill,
  pec,
  messageLegal,
  message,
  chat,
  docAttach,
  docAttachPDF,
  attachment,
  add,
  completed,
  fiscalCodeIndividual,
  creditCard,
  bonus,
  transactions,
  amount,
  coggle,
  locationiOS,
  locationiOSFilled,
  locationAndroid,
  notice,
  noticeFilled,
  reload,
  history,
  edit,
  battery,
  trashcan,
  calendar,
  profile,
  profileFilled,
  profileExperiment,
  magicWand,
  starEmpty,
  starFilled,
  switchOff,
  dotMenu,
  barcode,
  device,
  save,
  login,
  logout,
  ladybug,
  tag,
  gallery,
  externalLink,
  unknownGdo,
  cancel,
  help,
  search,
  close,
  closeSmall,
  success,
  canceled,
  errorFilled,
  warningFilled,
  info,
  infoFilled,
  arrowBottom,
  arrowLeft,
  arrowTop,
  arrowRight,
  backiOS,
  backAndroid,
  chevronTop,
  chevronBottom,
  chevronRight,
  chevronLeft,
  chevronRightListItem,
  docGiacenza,
  security,
  psp,
  refund
} = IOIcons;

export const IOIconsNew = {
  qrCode,
  website,
  abacus,
  home,
  bell,
  homeFill,
  copy,
  institution,
  hourglass,
  shareiOs,
  shareAndroid,
  locked,
  unlocked,
  initiatives,
  analytics,
  fornitori,
  eyeShow,
  eyeHide,
  pinOn,
  pinOff,
  emojiSad,
  emojiHappy,
  phone,
  email,
  emailFill,
  pec,
  messageLegal,
  message,
  chat,
  docAttach,
  docAttachPDF,
  attachment,
  add,
  completed,
  fiscalCodeIndividual,
  creditCard,
  bonus,
  transactions,
  amount,
  locationiOS,
  locationiOSFilled,
  locationAndroid,
  coggle,
  notice,
  noticeFilled,
  reload,
  history,
  edit,
  battery,
  trashcan,
  calendar,
  profile,
  profileFilled,
  profileExperiment,
  magicWand,
  starEmpty,
  starFilled,
  switchOff,
  dotMenu,
  barcode,
  device,
  save,
  login,
  logout,
  ladybug,
  tag,
  gallery,
  externalLink,
  unknownGdo,
  cancel,
  help,
  search,
  close,
  closeSmall,
  success,
  canceled,
  errorFilled,
  warningFilled,
  infoFilled,
  info,
  arrowBottom,
  arrowLeft,
  arrowTop,
  arrowRight,
  backiOS,
  backAndroid,
  chevronTop,
  chevronBottom,
  chevronRight,
  chevronLeft,
  chevronRightListItem,
  docGiacenza,
  security,
  psp,
  refund
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

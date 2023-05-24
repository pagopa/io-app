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
import IconEmailFill from "./svg/IconEmailFill";
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
import IconNavScan from "./svg/IconNavScan";
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
import LegIconSearch from "./svg/LegIconSearch";
import LegIconChevronLeft from "./svg/LegIconChevronLeft";
import LegIconRadioOn from "./svg/LegIconRadioOn";
import LegIconRadioOff from "./svg/LegIconRadioOff";
import LegIconCheckOn from "./svg/LegIconCheckOn";
import LegIconCheckOff from "./svg/LegIconCheckOff";

export const IOIcons = {
  spid: IconSpid,
  cie: IconCie /* io-cie */,
  qrCode: IconQrCode,
  bell: IconBell,
  website: IconWebsite,
  abacus: IconAbacus,
  home: IconHome,
  homeFill: IconHomeFill,
  copy: IconCopy,
  selfCert: IconSelfCertification,
  institution: IconInstitution,
  hourglass: IconHourglass,
  shareiOs: IconShareiOs,
  shareAndroid: IconShareAndroid,
  locked: IconLockOn /* io-lucchetto */,
  unlocked: IconLockOff,
  initiatives: IconInitiatives,
  analytics: IconAnalytics,
  fornitori: IconFornitori,
  eyeShow: IconEyeShow,
  eyeHide: IconEyeHide,
  pinOff: IconPinOff,
  pinOn: IconPinOn,
  emojiSad: IconEmojiSad,
  emojiHappy: IconEmojiHappy,
  phone: IconPhone /* io-phone */,
  email: IconEmail /* io-envelope */,
  emailFill: IconEmailFill,
  pec: IconPEC,
  messageLegal: IconMessageLegal,
  message: IconMessage,
  chat: IconChat,
  doc: IconDocument,
  docSign: IconDocumentSign,
  docAgree: IconAgreement,
  security: IconSecurity,
  docGiacenza: IconGiacenza,
  docAttach: IconDocumentAttachment,
  docAttachPDF: IconDocumentAttachmentPDF,
  attachment: IconAttachment,
  add: IconAdd,
  completed: IconCompleted,
  success: IconSuccess,
  ok: IconOk,
  fiscalCodeIndividual: IconFiscalCodeIndividual,
  creditCard: IconCreditCard /* io-carta */,
  bonus: IconBonus,
  transactions: IconTransactions,
  amount: IconAmount,
  psp: IconPSP,
  locationiOS: IconLocationiOS,
  locationiOSFilled: IconLocationiOSFilled,
  locationAndroid: IconLocationAndroid,
  coggle: IconCoggle,
  warningFilled: IconWarningFilled,
  notice: IconNotice /* io-warning */,
  noticeFilled: IconNoticeFilled,
  info: IconInfo,
  infoFilled: IconInfoFilled,
  canceled: IconCanceled,
  errorFilled: IconErrorFilled,
  refund: IconRefund,
  reload: IconReload,
  history: IconHistory,
  edit: IconEdit,
  battery: IconBattery,
  trashcan: IconTrashcan,
  calendar: IconCalendar /* io-calendar */ /* io-calendario */,
  profile: IconProfile,
  profileFilled: IconProfileFilled,
  profileAlt: IconProfileAlt /* io-titolare */,
  profileExperiment: IconProfileExperiment,
  magicWand: IconMagicWand,
  starFilled: IconStarFilled,
  starEmpty: IconStarEmpty,
  switchOff: IconSwitchOff,
  device: IconDevice,
  dotMenu: IconDotMenu,
  barcode: IconBarcode,
  save: IconSave,
  login: IconLogin,
  logout: IconLogout,
  ladybug: IconLadybug,
  tag: IconTag,
  gallery: IconGallery,
  externalLink: IconExternalLink,
  cancel: IconCancel,
  help: IconQuestion /* io-question */,
  search: IconSearch /* io-search */,
  legSearch: LegIconSearch,
  chevronRight: IconChevronRight,
  chevronLeft: IconChevronLeft,
  chevronBottom: IconChevronBottom,
  chevronTop: IconChevronTop,
  chevronRightListItem: IconChevronRightListItem,
  legChevronLeft: LegIconChevronLeft,
  close: IconClose /* io-close */,
  closeSmall: IconCloseSmall,
  arrowBottom: IconArrowBottom,
  arrowLeft: IconArrowLeft,
  arrowTop: IconArrowTop,
  arrowRight: IconArrowRight,
  backiOS: IconBackiOS,
  backAndroid: IconBackAndroid,
  navMessages: IconNavMessages /* io-messaggi */,
  navWallet: IconNavWallet /* io-portafoglio */,
  navScan: IconNavScan,
  navServices: IconNavServices,
  navProfile: IconNavProfile,
  legRadioOn: LegIconRadioOn,
  legRadioOff: LegIconRadioOff,
  legCheckOn: LegIconCheckOn,
  legCheckOff: LegIconCheckOff,
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

/* The following values should be deleted: 12, 30 */
/* 96 is too big for an icon, it should be replaced
with a Pictogram instead */
export type IOIconSizeScale = 12 | 16 | 20 | 24 | 30 | 32 | 48 | 96;
/* Sizes used exclusively for the Checkbox component */
export type IOIconSizeScaleCheckbox = 14 | 18;

export type IOIconsProps = {
  name: IOIcons;
  color?: IOColors;
  size?: IOIconSizeScale | IOIconSizeScaleCheckbox | "100%";
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
  importantForAccessibility:
    | "auto"
    | "yes"
    | "no"
    | "no-hide-descendants"
    | undefined;
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
  size?: IOIconSizeScale | "100%";
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
// const {} = IOIcons;

// export const IOIconsNew = {};

/* Navigation */
const { navMessages, navWallet, navScan, navServices, navProfile } = IOIcons;

export const IONavIcons = {
  navMessages,
  navWallet,
  navScan,
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

import { ColorValue } from "react-native";
import Animated from "react-native-reanimated";
import { Component } from "react";
import { IOColors } from "../../core/IOColors";
import { useIOFontDynamicScale } from "../../utils/accessibility";
/* Icons */
import IconAbacus from "./svg/IconAbacus";
import IconAccessibility from "./svg/IconAccessibility";
import IconAdd from "./svg/IconAdd";
import IconAddSmall from "./svg/IconAddSmall";
import IconAmount from "./svg/IconAmount";
import IconAnalytics from "./svg/IconAnalytics";
import IconArchive from "./svg/IconArchive";
import IconArchiveFilled from "./svg/IconArchiveFilled";
import IconArrowBottom from "./svg/IconArrowBottom";
import IconArrowLeft from "./svg/IconArrowLeft";
import IconArrowRight from "./svg/IconArrowRight";
import IconArrowTop from "./svg/IconArrowTop";
import IconAttachment from "./svg/IconAttachment";
import IconBackAndroid from "./svg/IconBackAndroid";
import IconBackiOS from "./svg/IconBackiOS";
import IconBarcode from "./svg/IconBarcode";
import IconBattery from "./svg/IconBattery";
import IconBell from "./svg/IconBell";
import IconBiomFaceID from "./svg/IconBiomFaceID";
import IconBiomFingerprint from "./svg/IconBiomFingerprint";
import IconBonus from "./svg/IconBonus";
import IconBonusFilled from "./svg/IconBonusFilled";
import IconCalendar from "./svg/IconCalendar";
import IconCancel from "./svg/IconCancel";
import IconCanceled from "./svg/IconCanceled";
import IconCar from "./svg/IconCar";
import IconCategCulture from "./svg/IconCategCulture";
import IconCategFinance from "./svg/IconCategFinance";
import IconCategHome from "./svg/IconCategHome";
import IconCategJobOffers from "./svg/IconCategJobOffers";
import IconCategLearning from "./svg/IconCategLearning";
import IconCategMobility from "./svg/IconCategMobility";
import IconCategShopping from "./svg/IconCategShopping";
import IconCategSport from "./svg/IconCategSport";
import IconCategSustainability from "./svg/IconCategSustainability";
import IconCategTelco from "./svg/IconCategTelco";
import IconCategTravel from "./svg/IconCategTravel";
import IconCategWellness from "./svg/IconCategWellness";
import IconChange from "./svg/IconChange";
import IconChat from "./svg/IconChat";
import IconCheckTick from "./svg/IconCheckTick";
import IconCheckTickBig from "./svg/IconCheckTickBig";
import IconChevronBottom from "./svg/IconChevronBottom";
import IconChevronLeft from "./svg/IconChevronLeft";
import IconChevronRight from "./svg/IconChevronRight";
import IconChevronRightListItem from "./svg/IconChevronRightListItem";
import IconChevronTop from "./svg/IconChevronTop";
import IconCie from "./svg/IconCie";
import IconCieCard from "./svg/IconCieCard";
import IconCieLetter from "./svg/IconCieLetter";
import IconCloseLarge from "./svg/IconCloseLarge";
import IconCloseMedium from "./svg/IconCloseMedium";
import IconCloseSmall from "./svg/IconCloseSmall";
import IconCode from "./svg/IconCode";
import IconCoggle from "./svg/IconCoggle";
import IconCompare from "./svg/IconCompare";
import IconContactless from "./svg/IconContactless";
import IconCopy from "./svg/IconCopy";
import IconCreditCard from "./svg/IconCreditCard";
import IconCreditCardFilled from "./svg/IconCreditCardFilled";
import IconCreditCardOff from "./svg/IconCreditCardOff";
import IconDevice from "./svg/IconDevice";
import IconDeviceVibration from "./svg/IconDeviceVibration";
import IconDocGiacenza from "./svg/IconDocGiacenza";
import IconDocPaymentCode from "./svg/IconDocPaymentCode";
import IconDocPaymentTitle from "./svg/IconDocPaymentTitle";
import IconDocumentAdd from "./svg/IconDocumentAdd";
import IconDocumentAttachment from "./svg/IconDocumentAttachment";
import IconDocumentAttachmentPDF from "./svg/IconDocumentAttachmentPDF";
import IconDotMenu from "./svg/IconDotMenu";
import IconEUStars from "./svg/IconEUStars";
import IconEdit from "./svg/IconEdit";
import IconEmail from "./svg/IconEmail";
import IconEmailFill from "./svg/IconEmailFill";
import IconEmojiHappy from "./svg/IconEmojiHappy";
import IconEmojiSad from "./svg/IconEmojiSad";
import IconEntityCode from "./svg/IconEntityCode";
import IconErrorFilled from "./svg/IconErrorFilled";
import IconExternalLink from "./svg/IconExternalLink";
import IconExternalLinkSmall from "./svg/IconExternalLinkSmall";
import IconEyeHide from "./svg/IconEyeHide";
import IconEyeShow from "./svg/IconEyeShow";
import IconFamilySharing from "./svg/IconFamilySharing";
import IconFilterAndroid from "./svg/IconFilterAndroid";
import IconFilterOffiOS from "./svg/IconFilterOffiOS";
import IconFilterOniOS from "./svg/IconFilterOniOS";
import IconFingerprint from "./svg/IconFingerprint";
import IconFiscalCodeIndividual from "./svg/IconFiscalCodeIndividual";
import IconFolder from "./svg/IconFolder";
import IconFornitori from "./svg/IconFornitori";
import IconForward from "./svg/IconForward";
import IconGallery from "./svg/IconGallery";
import IconHealthCard from "./svg/IconHealthCard";
import IconHeartEmpty from "./svg/IconHeartEmpty";
import IconHeartFilled from "./svg/IconHeartFilled";
import IconHeartOff from "./svg/IconHeartOff";
import IconHistory from "./svg/IconHistory";
import IconHome from "./svg/IconHome";
import IconHomeFill from "./svg/IconHomeFill";
import IconHourglass from "./svg/IconHourglass";
import IconInboxEmpty from "./svg/IconInboxEmpty";
import IconInboxFilled from "./svg/IconInboxFilled";
import IconInfo from "./svg/IconInfo";
import IconInfoFilled from "./svg/IconInfoFilled";
import IconInitiatives from "./svg/IconInitiatives";
import IconInstitution from "./svg/IconInstitution";
import IconInstruction from "./svg/IconInstruction";
import IconKey from "./svg/IconKey";
import IconKeyboard from "./svg/IconKeyboard";
import IconKeyboardDown from "./svg/IconKeyboardDown";
import IconLadybug from "./svg/IconLadybug";
import IconLegalValue from "./svg/IconLegalValue";
import IconLight from "./svg/IconLight";
import IconLightFilled from "./svg/IconLightFilled";
import IconLightbulb from "./svg/IconLightbulb";
import IconLocationAndroid from "./svg/IconLocationAndroid";
import IconLocationiOS from "./svg/IconLocationiOS";
import IconLocationiOSFilled from "./svg/IconLocationiOSFilled";
import IconLockOff from "./svg/IconLockOff";
import IconLockOn from "./svg/IconLockOn";
import IconLogin from "./svg/IconLogin";
import IconLogout from "./svg/IconLogout";
import IconMagicWand from "./svg/IconMagicWand";
import IconMapPin from "./svg/IconMapPin";
import IconMerchant from "./svg/IconMerchant";
import IconMessage from "./svg/IconMessage";
import IconMessageLegal from "./svg/IconMessageLegal";
import IconMultiCard from "./svg/IconMultiCard";
import IconNavMessages from "./svg/IconNavMessages";
import IconNavMessagesFocused from "./svg/IconNavMessagesFocused";
import IconNavProfile from "./svg/IconNavProfile";
import IconNavProfileFocused from "./svg/IconNavProfileFocused";
import IconNavQrWallet from "./svg/IconNavQrWallet";
import IconNavScan from "./svg/IconNavScan";
import IconNavServices from "./svg/IconNavServices";
import IconNavServicesFocused from "./svg/IconNavServicesFocused";
import IconNavWallet from "./svg/IconNavWallet";
import IconNavWalletFocused from "./svg/IconNavWalletFocused";
import IconNotes from "./svg/IconNotes";
import IconNotice from "./svg/IconNotice";
import IconNoticeFilled from "./svg/IconNoticeFilled";
import IconNoticePlain from "./svg/IconNoticePlain";
import IconNotification from "./svg/IconNotification";
import IconOk from "./svg/IconOk";
import IconOption from "./svg/IconOption";
import IconPEC from "./svg/IconPEC";
import IconPSP from "./svg/IconPSP";
import IconPhone from "./svg/IconPhone";
import IconPinOff from "./svg/IconPinOff";
import IconPinOn from "./svg/IconPinOn";
import IconPlay from "./svg/IconPlay";
import IconPrint from "./svg/IconPrint";
import IconProductIOApp from "./svg/IconProductIOApp";
import IconProductIOAppBlueBg from "./svg/IconProductIOAppBlueBg";
import IconProductITWallet from "./svg/IconProductITWallet";
import IconProductPagoPA from "./svg/IconProductPagoPA";
import IconProfile from "./svg/IconProfile";
import IconProfileRegistered from "./svg/IconProfileRegistered";
import IconQrCode from "./svg/IconQrCode";
import IconQuestion from "./svg/IconQuestion";
import IconRead from "./svg/IconRead";
import IconReceiptOff from "./svg/IconReceiptOff";
import IconReceiptOn from "./svg/IconReceiptOn";
import IconRefund from "./svg/IconRefund";
import IconReload from "./svg/IconReload";
import IconSave from "./svg/IconSave";
import IconSearch from "./svg/IconSearch";
import IconSecurity from "./svg/IconSecurity";
import IconSecurityPad from "./svg/IconSecurityPad";
import IconSelfCertification from "./svg/IconSelfCertification";
import IconShareAndroid from "./svg/IconShareAndroid";
import IconShareiOs from "./svg/IconShareiOs";
import IconSignal from "./svg/IconSignal";
import IconSparkles from "./svg/IconSparkles";
import IconSpid from "./svg/IconSpid";
import IconStarEmpty from "./svg/IconStarEmpty";
import IconStarFilled from "./svg/IconStarFilled";
import IconStarOff from "./svg/IconStarOff";
import IconStop from "./svg/IconStop";
import IconSuccess from "./svg/IconSuccess";
import IconSwitchCard from "./svg/IconSwitchCard";
import IconSwitchOff from "./svg/IconSwitchOff";
import IconSystemAppsAndroid from "./svg/IconSystemAppsAndroid";
import IconSystemBiometricRecognitionOS from "./svg/IconSystemBiometricRecognitionOS";
import IconSystemLocationiOS from "./svg/IconSystemLocationiOS";
import IconSystemNFC from "./svg/IconSystemNFC";
import IconSystemNotificationsInstructions from "./svg/IconSystemNotificationsInstructions";
import IconSystemPasswordAndroid from "./svg/IconSystemPasswordAndroid";
import IconSystemPasswordiOS from "./svg/IconSystemPasswordiOS";
import IconSystemPermissionsAndroid from "./svg/IconSystemPermissionsAndroid";
import IconSystemPhotosiOS from "./svg/IconSystemPhotosiOS";
import IconSystemPrivacyiOS from "./svg/IconSystemPrivacyiOS";
import IconSystemSettingsAndroid from "./svg/IconSystemSettingsAndroid";
import IconSystemSettingsiOS from "./svg/IconSystemSettingsiOS";
import IconSystemToggleInstructions from "./svg/IconSystemToggleInstructions";
import IconTag from "./svg/IconTag";
import IconTerms from "./svg/IconTerms";
import IconTheme from "./svg/IconTheme";
import IconTouch from "./svg/IconTouch";
import IconTransactions from "./svg/IconTransactions";
import IconTransactionsBoxed from "./svg/IconTransactionsBoxed";
import IconTrashcan from "./svg/IconTrashcan";
import IconTypeface from "./svg/IconTypeface";
import IconWarningFilled from "./svg/IconWarningFilled";
import IconWebsite from "./svg/IconWebsite";

export const IOIcons = {
  spid: IconSpid,
  cie: IconCie /* io-cie */,
  cieCard: IconCieCard,
  cieLetter: IconCieLetter,
  qrCode: IconQrCode,
  bell: IconBell,
  website: IconWebsite,
  abacus: IconAbacus,
  home: IconHome,
  homeFill: IconHomeFill,
  copy: IconCopy,
  selfCert: IconSelfCertification,
  institution: IconInstitution,
  merchant: IconMerchant,
  hourglass: IconHourglass,
  shareiOs: IconShareiOs,
  shareAndroid: IconShareAndroid,
  filterOniOS: IconFilterOniOS,
  filterOffiOS: IconFilterOffiOS,
  filterAndroid: IconFilterAndroid,
  locked: IconLockOn,
  unlocked: IconLockOff,
  initiatives: IconInitiatives,
  analytics: IconAnalytics,
  fornitori: IconFornitori,
  eyeShow: IconEyeShow,
  eyeHide: IconEyeHide,
  pinOff: IconPinOff,
  pinOn: IconPinOn,
  play: IconPlay,
  stop: IconStop,
  emojiSad: IconEmojiSad,
  emojiHappy: IconEmojiHappy,
  phone: IconPhone,
  email: IconEmail,
  emailFill: IconEmailFill,
  pec: IconPEC,
  messageLegal: IconMessageLegal,
  message: IconMessage,
  chat: IconChat,
  archive: IconArchive,
  archiveFilled: IconArchiveFilled,
  inbox: IconInboxEmpty,
  inboxFilled: IconInboxFilled,
  security: IconSecurity,
  securityPad: IconSecurityPad,
  option: IconOption,
  key: IconKey,
  documentAdd: IconDocumentAdd,
  docGiacenza: IconDocGiacenza,
  docPaymentTitle: IconDocPaymentTitle,
  docPaymentCode: IconDocPaymentCode,
  docAttach: IconDocumentAttachment,
  docAttachPDF: IconDocumentAttachmentPDF,
  folder: IconFolder,
  receiptOn: IconReceiptOn,
  receiptOff: IconReceiptOff,
  notes: IconNotes,
  attachment: IconAttachment,
  print: IconPrint,
  add: IconAdd,
  addSmall: IconAddSmall,
  success: IconSuccess,
  ok: IconOk,
  fiscalCodeIndividual: IconFiscalCodeIndividual,
  entityCode: IconEntityCode,
  creditCard: IconCreditCard,
  creditCardOff: IconCreditCardOff,
  creditCardFilled: IconCreditCardFilled,
  multiCard: IconMultiCard,
  bonus: IconBonus,
  bonusFilled: IconBonusFilled,
  transactionsBoxed: IconTransactionsBoxed,
  transactions: IconTransactions,
  amount: IconAmount,
  psp: IconPSP,
  mapPin: IconMapPin,
  locationiOS: IconLocationiOS,
  locationiOSFilled: IconLocationiOSFilled,
  locationAndroid: IconLocationAndroid,
  coggle: IconCoggle,
  warningFilled: IconWarningFilled,
  notice: IconNotice,
  noticeFilled: IconNoticeFilled,
  noticePlain: IconNoticePlain,
  info: IconInfo,
  infoFilled: IconInfoFilled,
  canceled: IconCanceled,
  errorFilled: IconErrorFilled,
  legalValue: IconLegalValue,
  refund: IconRefund,
  reload: IconReload,
  history: IconHistory,
  edit: IconEdit,
  battery: IconBattery,
  trashcan: IconTrashcan,
  calendar: IconCalendar,
  profile: IconProfile,
  profileRegistered: IconProfileRegistered,
  familySharing: IconFamilySharing,
  lightbulb: IconLightbulb,
  magicWand: IconMagicWand,
  sparkles: IconSparkles,
  starEmpty: IconStarEmpty,
  starFilled: IconStarFilled,
  starOff: IconStarOff,
  heartEmpty: IconHeartEmpty,
  heartFilled: IconHeartFilled,
  heartOff: IconHeartOff,
  switchOff: IconSwitchOff,
  switchCard: IconSwitchCard,
  fingerprint: IconFingerprint,
  touch: IconTouch,
  device: IconDevice,
  deviceVibration: IconDeviceVibration,
  contactless: IconContactless,
  signal: IconSignal,
  notification: IconNotification,
  keyboard: IconKeyboard,
  keyboardDown: IconKeyboardDown,
  dotMenu: IconDotMenu,
  barcode: IconBarcode,
  save: IconSave,
  login: IconLogin,
  logout: IconLogout,
  ladybug: IconLadybug,
  tag: IconTag,
  gallery: IconGallery,
  externalLink: IconExternalLink,
  externalLinkSmall: IconExternalLinkSmall,
  forward: IconForward,
  cancel: IconCancel,
  compare: IconCompare,
  instruction: IconInstruction,
  terms: IconTerms,
  help: IconQuestion,
  search: IconSearch,
  accessibility: IconAccessibility,
  car: IconCar,
  healthCard: IconHealthCard,
  chevronRight: IconChevronRight,
  chevronLeft: IconChevronLeft,
  chevronBottom: IconChevronBottom,
  chevronTop: IconChevronTop,
  chevronRightListItem: IconChevronRightListItem,
  closeLarge: IconCloseLarge,
  closeMedium: IconCloseMedium,
  closeSmall: IconCloseSmall,
  arrowBottom: IconArrowBottom,
  arrowLeft: IconArrowLeft,
  arrowTop: IconArrowTop,
  arrowRight: IconArrowRight,
  change: IconChange,
  backiOS: IconBackiOS,
  backAndroid: IconBackAndroid,
  checkTick: IconCheckTick,
  checkTickBig: IconCheckTickBig,
  read: IconRead,
  light: IconLight,
  lightFilled: IconLightFilled,
  code: IconCode,
  theme: IconTheme,
  typeface: IconTypeface,
  navMessages: IconNavMessages,
  navMessagesFocused: IconNavMessagesFocused,
  navWallet: IconNavWallet,
  navWalletFocused: IconNavWalletFocused,
  navQrWallet: IconNavQrWallet,
  navScan: IconNavScan,
  navServices: IconNavServices,
  navServicesFocused: IconNavServicesFocused,
  navProfile: IconNavProfile,
  navProfileFocused: IconNavProfileFocused,
  navPsp: IconPSP,
  biomFingerprint: IconBiomFingerprint,
  biomFaceID: IconBiomFaceID,
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
  productPagoPA: IconProductPagoPA,
  productIOAppBlueBg: IconProductIOAppBlueBg,
  productITWallet: IconProductITWallet,
  systemSettingsAndroid: IconSystemSettingsAndroid,
  systemSettingsiOS: IconSystemSettingsiOS,
  systemToggleInstructions: IconSystemToggleInstructions,
  systemAppsAndroid: IconSystemAppsAndroid,
  systemNotificationsInstructions: IconSystemNotificationsInstructions,
  systemPermissionsAndroid: IconSystemPermissionsAndroid,
  systemLocationiOS: IconSystemLocationiOS,
  systemPhotosiOS: IconSystemPhotosiOS,
  systemPrivacyiOS: IconSystemPrivacyiOS,
  systemBiometricRecognitionOS: IconSystemBiometricRecognitionOS,
  systemNFC: IconSystemNFC,
  systemPasswordAndroid: IconSystemPasswordAndroid,
  systemPasswordiOS: IconSystemPasswordiOS,
  euStars: IconEUStars
} as const;

export type IOIcons = keyof typeof IOIcons;

export type IOIconSizeScale = 16 | 20 | 24 | 32 | 48;
/* Sizes used exclusively for the Checkbox component */
export type IOIconSizeScaleCheckbox = 14 | 18;

export type IOIconsProps = {
  name: IOIcons;
  color?: IOColors;
  size?: IOIconSizeScale | IOIconSizeScaleCheckbox | "100%";
  testID?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
  allowFontScaling?: boolean;
};

/*
Static icon component. Use it when you need an ion that doesn't
change its color values. It accepts `IOColors` values only.
*/
export const Icon = ({
  name,
  color = "grey-700",
  size = 24,
  accessible = false,
  accessibilityLabel = "",
  allowFontScaling = false,
  ...props
}: IOIconsProps) => {
  const { dynamicFontScale } = useIOFontDynamicScale();

  const IconElement = IOIcons[name];
  const isAccessible = accessible && accessibilityLabel.trim().length > 0;
  const iconSize =
    allowFontScaling && typeof size === "number"
      ? size * dynamicFontScale
      : size;

  return (
    <IconElement
      {...props}
      color={IOColors[color]}
      size={iconSize}
      accessible={isAccessible}
      accessibilityElementsHidden={!isAccessible}
      accessibilityLabel={accessibilityLabel}
      importantForAccessibility={isAccessible ? "auto" : "no-hide-descendants"}
      pointerEvents="none"
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
  allowFontScaling?: boolean;
};

export const AnimatedIcon = ({
  name,
  color = IOColors["grey-700"],
  size = 24,
  accessible = false,
  allowFontScaling = false,
  ...props
}: IOAnimatedIconsProps) => {
  const { dynamicFontScale } = useIOFontDynamicScale();

  const IconElement = IOIcons[name];
  const iconSize =
    allowFontScaling && typeof size === "number"
      ? size * dynamicFontScale
      : size;

  return (
    <IconElement
      {...props}
      color={color}
      size={iconSize}
      accessible={accessible}
      accessibilityElementsHidden={true}
      accessibilityLabel={""}
      importantForAccessibility={"no-hide-descendants"}
      pointerEvents="none"
    />
  );
};

/* Make <Icon> component animatable. Reanimated supports class components only,
so we need to convert <Icon> into a class component first.
https://github.com/software-mansion/react-native-reanimated/discussions/1527  */
class AnimatedIconClassComponent extends Component<IOAnimatedIconsProps> {
  constructor(props: IOAnimatedIconsProps) {
    super(props);
  }
  render() {
    return <AnimatedIcon {...this.props} />;
  }
}

/*
A name that explicitly indicates the purpose of the component.
It must be used in combination with `useAnimatedProps` hook.
*/
export const AnimatedIconWithColorTransition = Animated.createAnimatedComponent(
  AnimatedIconClassComponent
);

/*
░░░ VARIOUS SETS ░░░
*/

/* New icons */
const { sparkles, profileRegistered, documentAdd, securityPad, multiCard } =
  IOIcons;

export const IOIconsNew = {
  sparkles,
  profileRegistered,
  documentAdd,
  securityPad,
  multiCard
};

/* Navigation */
const {
  navMessages,
  navWallet,
  navScan,
  navServices,
  navProfile,
  navPsp,
  navMessagesFocused,
  navWalletFocused,
  navServicesFocused,
  navProfileFocused,
  navQrWallet
} = IOIcons;

export const IONavIcons = {
  navMessages,
  navWallet,
  navScan,
  navServices,
  navProfile,
  navPsp,
  navMessagesFocused,
  navWalletFocused,
  navServicesFocused,
  navProfileFocused,
  navQrWallet
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
const { productIOApp, productPagoPA, productIOAppBlueBg, productITWallet } =
  IOIcons;

export const IOProductIcons = {
  productIOApp,
  productPagoPA,
  productIOAppBlueBg,
  productITWallet
} as const;

export type IOProductIcons = keyof typeof IOProductIcons;

/* System */
const {
  systemSettingsAndroid,
  systemSettingsiOS,
  systemToggleInstructions,
  systemAppsAndroid,
  systemNotificationsInstructions,
  systemPermissionsAndroid,
  systemLocationiOS,
  systemPhotosiOS,
  systemPrivacyiOS,
  systemBiometricRecognitionOS,
  systemNFC,
  systemPasswordAndroid,
  systemPasswordiOS
} = IOIcons;

export const IOSystemIcons = {
  systemSettingsAndroid,
  systemSettingsiOS,
  systemToggleInstructions,
  systemAppsAndroid,
  systemNotificationsInstructions,
  systemPermissionsAndroid,
  systemLocationiOS,
  systemPhotosiOS,
  systemPrivacyiOS,
  systemBiometricRecognitionOS,
  systemNFC,
  systemPasswordAndroid,
  systemPasswordiOS
} as const;

export type IOSystemIcons = keyof typeof IOSystemIcons;

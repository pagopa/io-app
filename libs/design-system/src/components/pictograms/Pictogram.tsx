import { JSX, useMemo } from "react";
import { ColorValue } from "react-native";
import { useIOTheme } from "../../context";
import { IOColors, IOThemeDark, IOThemeLight } from "../../core/IOColors";
import { useIOFontDynamicScale } from "../../utils/accessibility";

import PictogramAccessDenied from "./svg/PictogramAccessDenied";
import PictogramActivate from "./svg/PictogramActivate";
import PictogramAttachment from "./svg/PictogramAttachment";
import PictogramAttention from "./svg/PictogramAttention";
import PictogramBiometric from "./svg/PictogramBiometric";
import PictogramCameraDenied from "./svg/PictogramCameraDenied";
import PictogramCameraRequest from "./svg/PictogramCameraRequest";
import PictogramCharity from "./svg/PictogramCharity";
import PictogramCie from "./svg/PictogramCie";
import PictogramComunicationProblem from "./svg/PictogramComunicationProblem";
import PictogramEmpty from "./svg/PictogramEmpty";
import PictogramEmptyArchive from "./svg/PictogramEmptyArchive";
import PictogramFatalError from "./svg/PictogramFatalError";
import PictogramFeature from "./svg/PictogramFeature";
import PictogramFeedback from "./svg/PictogramFeedback";
import PictogramHello from "./svg/PictogramHello";
import PictogramHelp from "./svg/PictogramHelp";
import PictogramITWallet from "./svg/PictogramITWallet";
import PictogramIdentity from "./svg/PictogramIdentity";
import PictogramIdentityAdd from "./svg/PictogramIdentityAdd";
import PictogramIdentityCheck from "./svg/PictogramIdentityCheck";
import PictogramIdentityRefresh from "./svg/PictogramIdentityRefresh";
import PictogramNotification from "./svg/PictogramNotification";
import PictogramObjClock from "./svg/PictogramObjClock";
import PictogramObjFlyingMessage from "./svg/PictogramObjFlyingMessage";
import PictogramObjFollowMessage from "./svg/PictogramObjFollowMessage";
import PictogramObjIbanCard from "./svg/PictogramObjIbanCard";
import PictogramObjKey from "./svg/PictogramObjKey";
import PictogramObjManual from "./svg/PictogramObjManual";
import PictogramObjTrash from "./svg/PictogramObjTrash";
import PictogramPasscode from "./svg/PictogramPasscode";
import PictogramPayments from "./svg/PictogramPayments";
import PictogramPremiumCredentials from "./svg/PictogramPremiumCredentials";
import PictogramSecurity from "./svg/PictogramSecurity";
import PictogramStopSecurity from "./svg/PictogramStopSecurity";
import PictogramSuccess from "./svg/PictogramSuccess";
import PictogramTime from "./svg/PictogramTime";
import PictogramUmbrella from "./svg/PictogramUmbrella";
import PictogramUpdateOS from "./svg/PictogramUpdateOS";
import PictogramWorkInProgress from "./svg/PictogramWorkInProgress";
/* Bleed Pictograms */
import PictogramBleedAccessDenied from "./svg/PictogramBleedAccessDenied";
import PictogramBleedActivate from "./svg/PictogramBleedActivate";
import PictogramBleedAttachment from "./svg/PictogramBleedAttachment";
import PictogramBleedAttention from "./svg/PictogramBleedAttention";
import PictogramBleedCameraDenied from "./svg/PictogramBleedCameraDenied";
import PictogramBleedCameraRequest from "./svg/PictogramBleedCameraRequest";
import PictogramBleedCardAdd from "./svg/PictogramBleedCardAdd";
import PictogramBleedCardFavourite from "./svg/PictogramBleedCardFavourite";
import PictogramBleedCardIssue from "./svg/PictogramBleedCardIssue";
import PictogramBleedCardQuestion from "./svg/PictogramBleedCardQuestion";
import PictogramBleedCharity from "./svg/PictogramBleedCharity";
import PictogramBleedCie from "./svg/PictogramBleedCie";
import PictogramBleedDoc from "./svg/PictogramBleedDoc";
import PictogramBleedEmailDotNotif from "./svg/PictogramBleedEmailDotNotif";
import PictogramBleedEmpty from "./svg/PictogramBleedEmpty";
import PictogramBleedEnded from "./svg/PictogramBleedEnded";
import PictogramBleedFatalError from "./svg/PictogramBleedFatalError";
import PictogramBleedFeature from "./svg/PictogramBleedFeature";
import PictogramBleedFeedback from "./svg/PictogramBleedFeedback";
import PictogramBleedHelp from "./svg/PictogramBleedHelp";
import PictogramBleedITWallet from "./svg/PictogramBleedITWallet";
import PictogramBleedIdea from "./svg/PictogramBleedIdea";
import PictogramBleedIdentity from "./svg/PictogramBleedIdentity";
import PictogramBleedIdentityAdd from "./svg/PictogramBleedIdentityAdd";
import PictogramBleedIdentityCheck from "./svg/PictogramBleedIdentityCheck";
import PictogramBleedIdentityRefresh from "./svg/PictogramBleedIdentityRefresh";
import PictogramBleedLostConnection from "./svg/PictogramBleedLostConnection";
import PictogramBleedMessage from "./svg/PictogramBleedMessage";
import PictogramBleedNotification from "./svg/PictogramBleedNotification";
import PictogramBleedPasscode from "./svg/PictogramBleedPasscode";
import PictogramBleedPayments from "./svg/PictogramBleedPayments";
import PictogramBleedPending from "./svg/PictogramBleedPending";
import PictogramBleedQrCode from "./svg/PictogramBleedQrCode";
import PictogramBleedReactivate from "./svg/PictogramBleedReactivate";
import PictogramBleedSavingMoney from "./svg/PictogramBleedSavingMoney";
import PictogramBleedSearch from "./svg/PictogramBleedSearch";
import PictogramBleedSecurity from "./svg/PictogramBleedSecurity";
import PictogramBleedSettings from "./svg/PictogramBleedSettings";
import PictogramBleedStar from "./svg/PictogramBleedStar";
import PictogramBleedStopSecurity from "./svg/PictogramBleedStopSecurity";
import PictogramBleedSuccess from "./svg/PictogramBleedSuccess";
import PictogramBleedTime from "./svg/PictogramBleedTime";
import PictogramBleedTiming from "./svg/PictogramBleedTiming";
import PictogramBleedWorkInProgress from "./svg/PictogramBleedWorkInProgress";
/* End Bleed Pictograms */
import PictogramCardAdd from "./svg/PictogramCardAdd";
import PictogramCardFavourite from "./svg/PictogramCardFavourite";
import PictogramCardIssue from "./svg/PictogramCardIssue";
import PictogramCardQuestion from "./svg/PictogramCardQuestion";
import PictogramDoc from "./svg/PictogramDoc";
import PictogramEmailDotCheck from "./svg/PictogramEmailDotCheck";
import PictogramEmailDotNotif from "./svg/PictogramEmailDotNotif";
import PictogramEmptyWallet from "./svg/PictogramEmptyWallet";
import PictogramEnded from "./svg/PictogramEnded";
import PictogramEventClose from "./svg/PictogramEventClose";
import PictogramFingerprint from "./svg/PictogramFingerprint";
import PictogramIdea from "./svg/PictogramIdea";
import PictogramLostConnection from "./svg/PictogramLostConnection";
import PictogramMessage from "./svg/PictogramMessage";
import PictogramMeterLimit from "./svg/PictogramMeterLimit";
import PictogramMoneyCheck from "./svg/PictogramMoneyCheck";
import PictogramNFCScanAndroid from "./svg/PictogramNFCScanAndroid";
import PictogramNFCScanGreyAndroid from "./svg/PictogramNFCScanGreyAndroid";
import PictogramNFCScaniOS from "./svg/PictogramNFCScaniOS";
import PictogramPending from "./svg/PictogramPending";
import PictogramPinSecurity from "./svg/PictogramPinSecurity";
import PictogramQrCode from "./svg/PictogramQrCode";
import PictogramReactivate from "./svg/PictogramReactivate";
import PictogramSavingMoney from "./svg/PictogramSavingMoney";
import PictogramSearchLens from "./svg/PictogramSearchLens";
import PictogramSendAccess from "./svg/PictogramSendAccess";
import PictogramSettings from "./svg/PictogramSettings";
import PictogramSmile from "./svg/PictogramSmile";
import PictogramStar from "./svg/PictogramStar";
import PictogramTiming from "./svg/PictogramTiming";
import PictogramWalletDoc from "./svg/PictogramWalletDoc";
import { SVGPictogramProps } from "./types";

export const IOPictograms = {
  empty: PictogramEmpty,
  feature: PictogramFeature,
  charity: PictogramCharity,
  attention: PictogramAttention,
  message: PictogramMessage,
  emptyArchive: PictogramEmptyArchive,
  umbrella: PictogramUmbrella,
  feedback: PictogramFeedback,
  idea: PictogramIdea,
  cameraRequest: PictogramCameraRequest,
  cameraDenied: PictogramCameraDenied,
  success: PictogramSuccess,
  fatalError: PictogramFatalError,
  help: PictogramHelp,
  itWallet: PictogramITWallet,
  updateOS: PictogramUpdateOS,
  identity: PictogramIdentity,
  identityAdd: PictogramIdentityAdd,
  identityRefresh: PictogramIdentityRefresh,
  identityCheck: PictogramIdentityCheck,
  accessDenied: PictogramAccessDenied,
  stopSecurity: PictogramStopSecurity,
  settings: PictogramSettings,
  security: PictogramSecurity,
  cie: PictogramCie,
  pending: PictogramPending,
  ended: PictogramEnded,
  time: PictogramTime,
  timing: PictogramTiming,
  searchLens: PictogramSearchLens,
  passcode: PictogramPasscode,
  notification: PictogramNotification,
  star: PictogramStar,
  doc: PictogramDoc,
  cardAdd: PictogramCardAdd,
  cardFavourite: PictogramCardFavourite,
  cardQuestion: PictogramCardQuestion,
  cardIssue: PictogramCardIssue,
  moneyCheck: PictogramMoneyCheck,
  reactivate: PictogramReactivate,
  activate: PictogramActivate,
  nfcScanAndroid: PictogramNFCScanAndroid,
  nfcScanGreyAndroid: PictogramNFCScanGreyAndroid,
  nfcScaniOS: PictogramNFCScaniOS,
  attachment: PictogramAttachment,
  lostConnection: PictogramLostConnection,
  qrCode: PictogramQrCode,
  emailDotNotif: PictogramEmailDotNotif,
  emailDotCheck: PictogramEmailDotCheck,
  biometric: PictogramBiometric,
  eventClose: PictogramEventClose,
  hello: PictogramHello,
  comunicationProblem: PictogramComunicationProblem,
  payments: PictogramPayments,
  workInProgress: PictogramWorkInProgress,
  smile: PictogramSmile,
  fingerprint: PictogramFingerprint,
  walletDoc: PictogramWalletDoc,
  emptyWallet: PictogramEmptyWallet,
  meterLimit: PictogramMeterLimit,
  savingMoney: PictogramSavingMoney,
  sendAccess: PictogramSendAccess,
  pinSecurity: PictogramPinSecurity,
  premiumCredentials: PictogramPremiumCredentials,
  // Start Objects Pictogram
  ibanCard: PictogramObjIbanCard,
  followMessage: PictogramObjFollowMessage,
  manual: PictogramObjManual,
  trash: PictogramObjTrash,
  clock: PictogramObjClock,
  key: PictogramObjKey,
  flyingMessage: PictogramObjFlyingMessage
  // End Objects Pictogram
};

export type IOPictograms = keyof typeof IOPictograms;

export type IOPictogramSizeScale = 48 | 64 | 72 | 80 | 120 | 180;

export type IOPictogramsProps = {
  name: IOPictograms;
  /* Not too happy about the API choice,
  but at least we have the same <StatusBar …>
  component props. */
  pictogramStyle?: "default" | "light-content" | "dark-content";
  size?: IOPictogramSizeScale | "100%";
  allowFontScaling?: boolean;
};

type PictogramPalette = {
  hands: ColorValue;
  main: ColorValue;
  secondary: ColorValue;
  tertiary: ColorValue;
};

export const Pictogram = ({
  name,
  pictogramStyle = "default",
  size = 120,
  allowFontScaling = false,
  ...props
}: IOPictogramsProps) => {
  const theme = useIOTheme();
  const { dynamicFontScale, spacingScaleMultiplier } = useIOFontDynamicScale();

  const PictogramElement = IOPictograms[name];

  const pictogramSize =
    allowFontScaling && typeof size === "number"
      ? size * dynamicFontScale * spacingScaleMultiplier
      : size;

  const themeObj = useMemo(() => {
    switch (pictogramStyle) {
      case "dark-content":
        return IOThemeLight;
      case "light-content":
        return IOThemeDark;
      case "default":
        return theme;
    }
  }, [pictogramStyle, theme]);

  const colorValues: PictogramPalette = useMemo(
    () => ({
      hands: IOColors[themeObj["pictogram-hands"]],
      main: IOColors[themeObj["pictogram-tint-main"]],
      secondary: IOColors[themeObj["pictogram-tint-secondary"]],
      tertiary: IOColors[themeObj["pictogram-tint-tertiary"]]
    }),
    [themeObj]
  );

  return (
    <PictogramElement
      {...props}
      size={pictogramSize}
      colorValues={colorValues}
    />
  );
};

/*
░░░ VARIOUS SETS ░░░
*/

/* Bleed pictograms
    Used in the <Banner /> component
*/

export type IOPictogramsBleed = Extract<
  | "empty"
  | "charity"
  | "attention"
  | "message"
  | "help"
  | "feedback"
  | "idea"
  | "itWallet"
  | "security"
  | "feature"
  | "cie"
  | "identity"
  | "identityAdd"
  | "identityCheck"
  | "identityRefresh"
  | "cameraRequest"
  | "cameraDenied"
  | "cardAdd"
  | "cardFavourite"
  | "cardQuestion"
  | "cardIssue"
  | "accessDenied"
  | "settings"
  | "stopSecurity"
  | "time"
  | "pending"
  | "ended"
  | "timing"
  | "searchLens"
  | "passcode"
  | "success"
  | "fatalError"
  | "notification"
  | "star"
  | "doc"
  | "notification"
  | "star"
  | "qrCode"
  | "lostConnection"
  | "payments"
  | "activate"
  | "reactivate"
  | "savingMoney"
  | "workInProgress"
  | "emailDotNotif"
  | "attachment",
  IOPictograms
>;

export const IOPictogramsBleed: {
  [key in IOPictogramsBleed]: ({ size }: SVGPictogramProps) => JSX.Element;
} = {
  empty: PictogramBleedEmpty,
  charity: PictogramBleedCharity,
  help: PictogramBleedHelp,
  attention: PictogramBleedAttention,
  message: PictogramBleedMessage,
  feedback: PictogramBleedFeedback,
  idea: PictogramBleedIdea,
  itWallet: PictogramBleedITWallet,
  security: PictogramBleedSecurity,
  feature: PictogramBleedFeature,
  cie: PictogramBleedCie,
  identity: PictogramBleedIdentity,
  identityAdd: PictogramBleedIdentityAdd,
  identityCheck: PictogramBleedIdentityCheck,
  identityRefresh: PictogramBleedIdentityRefresh,
  cameraRequest: PictogramBleedCameraRequest,
  cameraDenied: PictogramBleedCameraDenied,
  cardAdd: PictogramBleedCardAdd,
  cardFavourite: PictogramBleedCardFavourite,
  cardQuestion: PictogramBleedCardQuestion,
  cardIssue: PictogramBleedCardIssue,
  accessDenied: PictogramBleedAccessDenied,
  stopSecurity: PictogramBleedStopSecurity,
  settings: PictogramBleedSettings,
  time: PictogramBleedTime,
  pending: PictogramBleedPending,
  ended: PictogramBleedEnded,
  timing: PictogramBleedTiming,
  searchLens: PictogramBleedSearch,
  passcode: PictogramBleedPasscode,
  success: PictogramBleedSuccess,
  fatalError: PictogramBleedFatalError,
  notification: PictogramBleedNotification,
  star: PictogramBleedStar,
  doc: PictogramBleedDoc,
  qrCode: PictogramBleedQrCode,
  lostConnection: PictogramBleedLostConnection,
  payments: PictogramBleedPayments,
  activate: PictogramBleedActivate,
  reactivate: PictogramBleedReactivate,
  workInProgress: PictogramBleedWorkInProgress,
  savingMoney: PictogramBleedSavingMoney,
  emailDotNotif: PictogramBleedEmailDotNotif,
  attachment: PictogramBleedAttachment
};

export const PictogramBleed = ({
  name,
  size = 80,
  pictogramStyle = "default",
  allowFontScaling = false,
  ...props
}: IOPictogramsProps) => {
  const theme = useIOTheme();
  const { dynamicFontScale, spacingScaleMultiplier } = useIOFontDynamicScale();

  const PictogramElement = IOPictogramsBleed[name as IOPictogramsBleed];

  const pictogramSize =
    allowFontScaling && typeof size === "number"
      ? size * dynamicFontScale * spacingScaleMultiplier
      : size;

  const themeObj = useMemo(() => {
    switch (pictogramStyle) {
      case "dark-content":
        return IOThemeLight;
      case "light-content":
        return IOThemeDark;
      case "default":
        return theme;
    }
  }, [pictogramStyle, theme]);

  const colorValues: PictogramPalette = useMemo(
    () => ({
      hands: IOColors[themeObj["pictogram-hands"]],
      main: IOColors[themeObj["pictogram-tint-main"]],
      secondary: IOColors[themeObj["pictogram-tint-secondary"]],
      tertiary: IOColors[themeObj["pictogram-tint-tertiary"]]
    }),
    [themeObj]
  );

  return (
    <PictogramElement
      {...props}
      size={pictogramSize}
      colorValues={colorValues}
    />
  );
};

/* Object Pictograms */

const { ibanCard, followMessage, manual, trash, clock, key, flyingMessage } =
  IOPictograms;

export const IOPictogramsObject = {
  ibanCard,
  followMessage,
  manual,
  trash,
  clock,
  key,
  flyingMessage
} as const;

export type IOPictogramsObject = keyof typeof IOPictogramsObject;

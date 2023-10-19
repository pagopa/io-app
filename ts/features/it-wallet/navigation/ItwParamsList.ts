import { ItwAddCredentialsCheckScreenNavigationParams } from "../screens/credentials/ItwAddCredentialsCheckScreen";
import { ItwPidRequestScreenNavigationParams } from "../screens/issuing/ItwPidRequestScreen";
import { ItwCieCardReaderScreenNavigationParams } from "../screens/issuing/cie/ItwCieCardReaderScreen";
import { ItwCieConsentDataUsageScreenNavigationParams } from "../screens/issuing/cie/ItwCieConsentDataUsageScreen";
import { ItwCieWrongPinScreenNavigationParams } from "../screens/issuing/cie/ItwCieWrongPinScreen";
import { ItwRpInitScreenNavigationParams } from "../screens/presentation/crossdevice/ItwRpInitScreen";
import { ItwRpResultScreenNavigationParams } from "../screens/presentation/crossdevice/ItwRpPresentationScreen";
import { ITW_ROUTES } from "./ItwRoutes";

export type ItwParamsList = {
  // DISCOVERY
  [ITW_ROUTES.DISCOVERY.INFO]: undefined;
  [ITW_ROUTES.DISCOVERY.FEATURES_INFO]: undefined;
  // ISSUING CIE
  [ITW_ROUTES.ISSUING.CIE.EXPIRED_SCREEN]: undefined;
  [ITW_ROUTES.ISSUING.CIE.PIN_SCREEN]: undefined;
  [ITW_ROUTES.ISSUING.CIE
    .CARD_READER_SCREEN]: ItwCieCardReaderScreenNavigationParams;
  [ITW_ROUTES.ISSUING.CIE
    .CONSENT_DATA_USAGE]: ItwCieConsentDataUsageScreenNavigationParams;
  [ITW_ROUTES.ISSUING.CIE
    .WRONG_PIN_SCREEN]: ItwCieWrongPinScreenNavigationParams;
  [ITW_ROUTES.ISSUING.CIE.PIN_TEMP_LOCKED_SCREEN]: undefined;
  // ISSUING
  [ITW_ROUTES.ISSUING.PID_AUTH_INFO]: undefined;
  [ITW_ROUTES.ISSUING.PID_REQUEST]: ItwPidRequestScreenNavigationParams;
  [ITW_ROUTES.ISSUING.PID_PREVIEW]: undefined;
  [ITW_ROUTES.ISSUING.PID_ADDING]: undefined;
  // PRESENTATION PID
  [ITW_ROUTES.PRESENTATION.PID_DETAILS]: undefined;
  [ITW_ROUTES.PRESENTATION.CROSS_DEVICE.INIT]: ItwRpInitScreenNavigationParams;
  [ITW_ROUTES.PRESENTATION.CROSS_DEVICE
    .RESULT]: ItwRpResultScreenNavigationParams;
  // PRESENTATION CREDENTIALS
  [ITW_ROUTES.PRESENTATION.CROSS_DEVICE.CHECKS]: undefined;
  // CREDENTIALS
  [ITW_ROUTES.CREDENTIALS.CATALOG]: undefined;
  [ITW_ROUTES.CREDENTIALS
    .ADD_CHECKS]: ItwAddCredentialsCheckScreenNavigationParams;
  [ITW_ROUTES.CREDENTIALS.ISSUING_INFO]: undefined;
  [ITW_ROUTES.CREDENTIALS.PREVIEW]: undefined;
  // GENERIC
  [ITW_ROUTES.GENERIC.NOT_AVAILABLE]: undefined;
};

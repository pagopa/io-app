import { ItwPrCredentialDetailsScreenNavigationParams } from "../screens/presentation/ItwPrCredentialDetails";
import { ItwIssuingPidRequestScreenNavigationParams } from "../screens/issuing/pid/ItwIssuingPidRequestScreen";
import { ItwCieCardReaderScreenNavigationParams } from "../screens/issuing/pid/cie/ItwCieCardReaderScreen";
import { ItwCieConsentDataUsageScreenNavigationParams } from "../screens/issuing/pid/cie/ItwCieConsentDataUsageScreen";
import { ItwCieWrongPinScreenNavigationParams } from "../screens/issuing/pid/cie/ItwCieWrongPinScreen";
import { ItwPrRemotePidChecksScreenNavigationParams } from "../screens/presentation/remote/pid/ItwPrRemotePidChecksScreen";
import { ITW_ROUTES } from "./ItwRoutes";

export type ItwParamsList = {
  // ISSUING PID
  [ITW_ROUTES.ISSUING.PID.INFO]: undefined;
  [ITW_ROUTES.ISSUING.PID.AUTH]: undefined;
  [ITW_ROUTES.ISSUING.PID.AUTH_INFO]: undefined;
  [ITW_ROUTES.ISSUING.PID.REQUEST]: ItwIssuingPidRequestScreenNavigationParams;
  [ITW_ROUTES.ISSUING.PID.PREVIEW]: undefined;
  [ITW_ROUTES.ISSUING.PID.ADDING]: undefined;

  // ISSUING PID CIE
  [ITW_ROUTES.ISSUING.PID.CIE.EXPIRED_SCREEN]: undefined;
  [ITW_ROUTES.ISSUING.PID.CIE.PIN_SCREEN]: undefined;
  [ITW_ROUTES.ISSUING.PID.CIE
    .CARD_READER_SCREEN]: ItwCieCardReaderScreenNavigationParams;
  [ITW_ROUTES.ISSUING.PID.CIE
    .CONSENT_DATA_USAGE]: ItwCieConsentDataUsageScreenNavigationParams;
  [ITW_ROUTES.ISSUING.PID.CIE
    .WRONG_PIN_SCREEN]: ItwCieWrongPinScreenNavigationParams;
  [ITW_ROUTES.ISSUING.PID.CIE.PIN_TEMP_LOCKED_SCREEN]: undefined;

  // ISSUING CREDENTIALS
  [ITW_ROUTES.ISSUING.CREDENTIAL.CATALOG]: undefined;
  [ITW_ROUTES.ISSUING.CREDENTIAL.CHECKS]: undefined;
  [ITW_ROUTES.ISSUING.CREDENTIAL.AUTH]: undefined;
  [ITW_ROUTES.ISSUING.CREDENTIAL.PREVIEW]: undefined;

  // PRESENTATION REMOTE PID
  [ITW_ROUTES.PRESENTATION.PID.DETAILS]: undefined;
  [ITW_ROUTES.PRESENTATION.PID.REMOTE
    .INIT]: ItwPrRemotePidChecksScreenNavigationParams;
  [ITW_ROUTES.PRESENTATION.PID.REMOTE.DATA]: undefined;
  [ITW_ROUTES.PRESENTATION.PID.REMOTE.RESULT]: undefined;

  // PRESENTATION REMOTE CREDENTIAL
  [ITW_ROUTES.PRESENTATION.CREDENTIAL
    .DETAILS]: ItwPrCredentialDetailsScreenNavigationParams;
  [ITW_ROUTES.PRESENTATION.CREDENTIAL.REMOTE.INIT]: undefined;
  [ITW_ROUTES.PRESENTATION.CREDENTIAL.REMOTE.DATA]: undefined;
  [ITW_ROUTES.PRESENTATION.CREDENTIAL.REMOTE.RESULT]: undefined;

  // PRESENTATION PROXIMITY
  [ITW_ROUTES.PRESENTATION.PROXIMITY.QRCODE]: undefined;

  // GENERIC
  [ITW_ROUTES.GENERIC.NOT_AVAILABLE]: undefined;
};

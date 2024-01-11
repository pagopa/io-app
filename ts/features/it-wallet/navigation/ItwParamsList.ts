import { ItwPrCredentialDetailsScreenNavigationParams } from "../screens/presentation/ItwPrCredentialDetails";
import { ItwIssuancePidRequestScreenNavigationParams } from "../screens/issuance/pid/ItwIssuancePidRequestScreen";
import { ItwCieCardReaderScreenNavigationParams } from "../screens/issuance/pid/cie/ItwCieCardReaderScreen";
import { ItwCieConsentDataUsageScreenNavigationParams } from "../screens/issuance/pid/cie/ItwCieConsentDataUsageScreen";
import { ItwCieWrongPinScreenNavigationParams } from "../screens/issuance/pid/cie/ItwCieWrongPinScreen";
import { ItwPrRemotePidChecksScreenNavigationParams } from "../screens/presentation/remote/pid/ItwPrRemotePidChecksScreen";
import { ITW_ROUTES } from "./ItwRoutes";

export type ItwParamsList = {
  // ISSUANCE PID
  [ITW_ROUTES.ISSUANCE.PID.INFO]: undefined;
  [ITW_ROUTES.ISSUANCE.PID.AUTH]: undefined;
  [ITW_ROUTES.ISSUANCE.PID.AUTH_INFO]: undefined;
  [ITW_ROUTES.ISSUANCE.PID
    .REQUEST]: ItwIssuancePidRequestScreenNavigationParams;
  [ITW_ROUTES.ISSUANCE.PID.PREVIEW]: undefined;
  [ITW_ROUTES.ISSUANCE.PID.STORE]: undefined;

  // ISSUANCE PID CIE
  [ITW_ROUTES.ISSUANCE.PID.CIE.EXPIRED_SCREEN]: undefined;
  [ITW_ROUTES.ISSUANCE.PID.CIE.PIN_SCREEN]: undefined;
  [ITW_ROUTES.ISSUANCE.PID.CIE
    .CARD_READER_SCREEN]: ItwCieCardReaderScreenNavigationParams;
  [ITW_ROUTES.ISSUANCE.PID.CIE
    .CONSENT_DATA_USAGE]: ItwCieConsentDataUsageScreenNavigationParams;
  [ITW_ROUTES.ISSUANCE.PID.CIE
    .WRONG_PIN_SCREEN]: ItwCieWrongPinScreenNavigationParams;
  [ITW_ROUTES.ISSUANCE.PID.CIE.PIN_TEMP_LOCKED_SCREEN]: undefined;

  // ISSUANCE CREDENTIALS
  [ITW_ROUTES.ISSUANCE.CREDENTIAL.CATALOG]: undefined;
  [ITW_ROUTES.ISSUANCE.CREDENTIAL.CHECKS]: undefined;
  [ITW_ROUTES.ISSUANCE.CREDENTIAL.AUTH]: undefined;
  [ITW_ROUTES.ISSUANCE.CREDENTIAL.PREVIEW]: undefined;

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

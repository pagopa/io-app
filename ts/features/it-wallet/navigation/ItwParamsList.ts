import { ItwCredentialDetailsScreenNavigationParams } from "../screens/credential/ItwCredentialDetailsScreen";
import { ItwPidRequestScreenNavigationParams } from "../screens/issuing/ItwPidRequestScreen";
import { ItwCieCardReaderScreenNavigationParams } from "../screens/issuing/cie/ItwCieCardReaderScreen";
import { ItwCieConsentDataUsageScreenNavigationParams } from "../screens/issuing/cie/ItwCieConsentDataUsageScreen";
import { ItwCieWrongPinScreenNavigationParams } from "../screens/issuing/cie/ItwCieWrongPinScreen";
import { ItwRpInitScreenNavigationParams } from "../screens/presentation/crossdevice/ItwRpInitScreen";
import { ITW_ROUTES } from "./ItwRoutes";

export type ItwParamsList = {
  // ISSUING PID
  [ITW_ROUTES.ISSUING.PID.INFO]: undefined;
  [ITW_ROUTES.ISSUING.PID.AUTH]: undefined;
  [ITW_ROUTES.ISSUING.PID.AUTH_INFO]: undefined;
  [ITW_ROUTES.ISSUING.PID.REQUEST]: ItwPidRequestScreenNavigationParams;
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
  [ITW_ROUTES.PRESENTATION.PID.REMOTE.INIT]: ItwRpInitScreenNavigationParams;
  [ITW_ROUTES.PRESENTATION.PID.REMOTE.DATA]: undefined;
  [ITW_ROUTES.PRESENTATION.PID.REMOTE.RESULT]: undefined;

  // PRESENTATION REMOTE CREDENTIAL
  [ITW_ROUTES.PRESENTATION.CREDENTIAL
    .DETAILS]: ItwCredentialDetailsScreenNavigationParams;
  [ITW_ROUTES.PRESENTATION.CREDENTIAL.REMOTE.CHECKS]: undefined;
  [ITW_ROUTES.PRESENTATION.CREDENTIAL.REMOTE.DATA]: undefined;
  [ITW_ROUTES.PRESENTATION.CREDENTIAL.REMOTE.RESULT]: undefined;

  // GENERIC
  [ITW_ROUTES.GENERIC.NOT_AVAILABLE]: undefined;
};

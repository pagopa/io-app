import { ItwPidRequestScreenNavigationParams } from "../screens/issuing/ItwPidRequestScreen";
import { ItwCieCardReaderScreenNavigationParams } from "../screens/issuing/cie/ItwCieCardReaderScreen";
import { ItwCieConsentDataUsageScreenNavigationParams } from "../screens/issuing/cie/ItwCieConsentDataUsageScreen";
import { ItwCieInfoUsageScreenNavigationParams } from "../screens/issuing/cie/ItwCieInfoUsageScreen";
import { ItwCieWrongPinScreenNavigationParams } from "../screens/issuing/cie/ItwCieWrongPinScreen";
import { ITW_ROUTES } from "./ItwRoutes";

export type ItwParamsList = {
  // DISCOVERY
  [ITW_ROUTES.DISCOVERY.INFO]: undefined;
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
  [ITW_ROUTES.ISSUING.CIE
    .INFO_USAGE_SCREEN]: ItwCieInfoUsageScreenNavigationParams;
  // ISSUING
  [ITW_ROUTES.ISSUING.PID_AUTH_INFO]: undefined;
  [ITW_ROUTES.ISSUING.PID_REQUEST]: ItwPidRequestScreenNavigationParams;
  [ITW_ROUTES.ISSUING.PID_PREVIEW]: undefined;
  [ITW_ROUTES.ISSUING.PID_ADDING]: undefined;
  // PRESENTATION PID
  [ITW_ROUTES.PRESENTATION.PID_DETAILS]: undefined;
};

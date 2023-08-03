import { ItwPidRequestScreenNavigationParams } from "../screens/issuing/ItwPidRequestScreen";
import { CieCardReaderScreenNavigationParams } from "../screens/issuing/cie/CieCardReaderScreen";
import { CieConsentDataUsageScreenNavigationParams } from "../screens/issuing/cie/CieConsentDataUsageScreen";
import { CieInfoUsageNavigationParams } from "../screens/issuing/cie/CieInfoUsageScreen";
import { CieWrongCiePinScreenNavigationParams } from "../screens/issuing/cie/CieWrongCiePinScreen";
import { ITW_ROUTES } from "./routes";

export type ItwParamsList = {
  [ITW_ROUTES.ACTIVATION.DETAILS]: undefined;
  [ITW_ROUTES.ACTIVATION.INFO]: undefined;
  [ITW_ROUTES.ACTIVATION.PID_REQUEST]: ItwPidRequestScreenNavigationParams;
  [ITW_ROUTES.ACTIVATION.PID_PREVIEW]: undefined;
  [ITW_ROUTES.ACTIVATION.PID_ISSUING]: undefined;
  [ITW_ROUTES.ACTIVATION.CIE_EXPIRED_SCREEN]: undefined;
  [ITW_ROUTES.ACTIVATION.CIE_PIN_SCREEN]: undefined;
  [ITW_ROUTES.ACTIVATION
    .CIE_CARD_READER_SCREEN]: CieCardReaderScreenNavigationParams;
  [ITW_ROUTES.ACTIVATION
    .CIE_CONSENT_DATA_USAGE]: CieConsentDataUsageScreenNavigationParams;
  [ITW_ROUTES.ACTIVATION
    .CIE_WRONG_PIN_SCREEN]: CieWrongCiePinScreenNavigationParams;
  [ITW_ROUTES.ACTIVATION.CIE_PIN_TEMP_LOCKED_SCREEN]: undefined;
  [ITW_ROUTES.ACTIVATION.CIE_INFO_USAGE_SCREEN]: CieInfoUsageNavigationParams;
  [ITW_ROUTES.PRESENTATION.VC_DETAILS]: undefined;
};

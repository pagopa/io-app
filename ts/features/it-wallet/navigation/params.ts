import { CieCardReaderScreenNavigationParams } from "../screens/issuing/cie/CieCardReaderScreen";
import { CieConsentDataUsageScreenNavigationParams } from "../screens/issuing/cie/CieConsentDataUsageScreen";
import { CieWrongCiePinScreenNavigationParams } from "../screens/issuing/cie/CieWrongCiePinScreen";
import { ITW_ROUTES } from "./routes";

export type ItwParamsList = {
  [ITW_ROUTES.ACTIVATION.DETAILS]: undefined;
  [ITW_ROUTES.ACTIVATION.INFO]: undefined;
  [ITW_ROUTES.ACTIVATION.CIE_EXPIRED_SCREEN]: undefined;
  [ITW_ROUTES.ACTIVATION.CIE_PIN_SCREEN]: undefined;
  [ITW_ROUTES.ACTIVATION
    .CIE_CARD_READER_SCREEN]: CieCardReaderScreenNavigationParams;
  [ITW_ROUTES.ACTIVATION
    .CIE_CONSENT_DATA_USAGE]: CieConsentDataUsageScreenNavigationParams;
  [ITW_ROUTES.ACTIVATION
    .CIE_WRONG_PIN_SCREEN]: CieWrongCiePinScreenNavigationParams;
  [ITW_ROUTES.ACTIVATION.CIE_PIN_TEMP_LOCKED_SCREEN]: undefined;
};

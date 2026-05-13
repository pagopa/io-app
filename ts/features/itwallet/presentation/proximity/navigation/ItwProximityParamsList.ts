import { ItwProximityQrCodeScreenNavigationParams } from "../screens/ItwProximityQrCodePresentmentScreen";
import { ITW_PROXIMITY_ROUTES } from "./routes";

export type ItwProximityParamsList = {
  [ITW_PROXIMITY_ROUTES.BLUETOOTH_PERMISSIONS]: undefined;
  [ITW_PROXIMITY_ROUTES.BLUETOOTH_ACTIVATION]: undefined;
  [ITW_PROXIMITY_ROUTES.NFC_ACTIVATION]: undefined;
  [ITW_PROXIMITY_ROUTES.QR_CODE_PRESENTMENT]: ItwProximityQrCodeScreenNavigationParams;
  [ITW_PROXIMITY_ROUTES.NFC_PRESENTMENT]: undefined;
  [ITW_PROXIMITY_ROUTES.CLAIMS_DISCLOSURE]: undefined;
  [ITW_PROXIMITY_ROUTES.SEND_DOCUMENTS_RESPONSE]: undefined;
  [ITW_PROXIMITY_ROUTES.FAILURE]: undefined;
};

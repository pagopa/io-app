import { ItwProximityPresentmentScreenNavigationParams } from "../screens/ItwProximityPresentmentScreen";
import { ITW_PROXIMITY_ROUTES } from "./routes";

export type ItwProximityParamsList = {
  [ITW_PROXIMITY_ROUTES.BLUETOOTH_PERMISSIONS]: undefined;
  [ITW_PROXIMITY_ROUTES.BLUETOOTH_ACTIVATION]: undefined;
  [ITW_PROXIMITY_ROUTES.NFC_ACTIVATION]: undefined;
  [ITW_PROXIMITY_ROUTES.PRESENTMENT]: ItwProximityPresentmentScreenNavigationParams;
  [ITW_PROXIMITY_ROUTES.NFC_PRESENTMENT]: undefined;
  [ITW_PROXIMITY_ROUTES.CLAIMS_DISCLOSURE]: undefined;
  [ITW_PROXIMITY_ROUTES.SUCCESS]: undefined;
  [ITW_PROXIMITY_ROUTES.FAILURE]: undefined;
};

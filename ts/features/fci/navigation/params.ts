import { FciSignatureScreenNavigationParams } from "../screens/FciRouterScreen";
import { FCI_ROUTES } from "./routes";

export type FciParamsList = {
  [FCI_ROUTES.SIGNATURE]: FciSignatureScreenNavigationParams;
  [FCI_ROUTES.DOCUMENTS]: undefined;
};

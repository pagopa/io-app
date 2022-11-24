import { FciRouterScreenNavigationParams } from "../screens/FciRouterScreen";
import { FciDocumentsScreenNavigationParams } from "../screens/valid/FciDocumentsScreen";
import { FciSignatureFieldsScreenNavigationParams } from "../screens/valid/FciSignatureFieldsScreen";
import { FCI_ROUTES } from "./routes";

export type FciParamsList = {
  [FCI_ROUTES.ROUTER]: FciRouterScreenNavigationParams;
  [FCI_ROUTES.DOCUMENTS]: FciDocumentsScreenNavigationParams;
  [FCI_ROUTES.SIGNATURE_FIELDS]: FciSignatureFieldsScreenNavigationParams;
  [FCI_ROUTES.USER_DATA_SHARE]: undefined;
};

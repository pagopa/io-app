import { FciRouterScreenNavigationParams } from "../screens/FciRouterScreen";
import { FciDocumentPreviewScreenNavigationParams } from "../screens/valid/FciDocumentPreviewScreen";
import { FciDocumentsScreenNavigationParams } from "../screens/valid/FciDocumentsScreen";
import { FciSignatureFieldsScreenNavigationParams } from "../screens/valid/FciSignatureFieldsScreen";
import { FCI_ROUTES } from "./routes";

export type FciParamsList = {
  [FCI_ROUTES.ROUTER]: FciRouterScreenNavigationParams;
  [FCI_ROUTES.DOCUMENTS]: FciDocumentsScreenNavigationParams;
  [FCI_ROUTES.SIGNATURE_FIELDS]: FciSignatureFieldsScreenNavigationParams;
  [FCI_ROUTES.USER_DATA_SHARE]: undefined;
  [FCI_ROUTES.QTSP_TOS]: undefined;
  [FCI_ROUTES.TYP]: undefined;
  [FCI_ROUTES.DOC_PREVIEW]: FciDocumentPreviewScreenNavigationParams;
  [FCI_ROUTES.SIGNATURE_REQUESTS]: undefined;
};

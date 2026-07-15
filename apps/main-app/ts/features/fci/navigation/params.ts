import { FciRouterScreenNavigationParams } from "../screens/FciRouterScreen";
import { FciDocumentPreviewScreenNavigationParams } from "../screens/valid/FciDocumentPreviewScreen";
import { FciDocumentsScreenNavigationParams } from "../screens/valid/FciDocumentsScreen";
import { FciSignatureFieldsScreenNavigationParams } from "../screens/valid/FciSignatureFieldsScreen";
import { FciNetworkError } from "../utils/errors";
import { FCI_ROUTES } from "./routes";

export type FciDocumentUnavailableScreenNavigationParams = {
  errorKind?: FciNetworkError["kind"];
};

export type FciParamsList = {
  [FCI_ROUTES.DOC_PREVIEW]: FciDocumentPreviewScreenNavigationParams;
  [FCI_ROUTES.DOCUMENT_UNAVAILABLE]: FciDocumentUnavailableScreenNavigationParams;
  [FCI_ROUTES.DOCUMENTS]: FciDocumentsScreenNavigationParams;
  [FCI_ROUTES.FCI_LOGIN_L3]: undefined;
  [FCI_ROUTES.LOGIN_OPTIN]: undefined;
  [FCI_ROUTES.NFC_NOT_AVAILABLE]: undefined;
  [FCI_ROUTES.QTSP_TOS]: undefined;
  [FCI_ROUTES.ROUTER]: FciRouterScreenNavigationParams;
  [FCI_ROUTES.SIGNATURE_FIELDS]: FciSignatureFieldsScreenNavigationParams;
  [FCI_ROUTES.SIGNATURE_REQUESTS]: undefined;
  [FCI_ROUTES.TYP]: undefined;
  [FCI_ROUTES.USER_DATA_SHARE]: undefined;
};

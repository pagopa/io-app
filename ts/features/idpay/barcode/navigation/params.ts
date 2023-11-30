import { IdPayBarcodeResultRouteParams } from "../screens/IdPayBarcodeResultScreen";
import { IdPayBarcodeRoutes } from "./routes";

export type IdPayBarcodeParamsList = {
  [IdPayBarcodeRoutes.IDPAY_BARCODE_MAIN]: undefined;
  [IdPayBarcodeRoutes.IDPAY_BARCODE_RESULT]: IdPayBarcodeResultRouteParams;
};

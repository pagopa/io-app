import { useNavigation } from "@react-navigation/native";
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes
} from "react-native-haptic-feedback";
import { useOpenDeepLink } from "../../../hooks/useOpenDeepLink";
import { mixpanelTrack } from "../../../mixpanel";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { navigateToPaymentTransactionSummaryScreen } from "../../../store/actions/navigation";
import {
  PaymentStartOrigin,
  paymentInitializeState
} from "../../../store/actions/wallet/payment";
import { useIODispatch } from "../../../store/hooks";
import { WalletPaymentRoutes } from "../../walletV3/payment/navigation/routes";
import { IOBarcode, PagoPaBarcode } from "../types/IOBarcode";
import { getIOBarcodesByType } from "../utils/getBarcodesByType";

type IOBarcodesHandler = {
  /**
   * Handles the case with multiple barcodes.It gives priority to pagoPA barcodes.
   * @param barcodes Array of scanned barcodes
   * @returns true if the barcodes have been handled, false otherwise
   */
  handleMultipleBarcodes: (barcodes: Array<IOBarcode>) => boolean;

  /**
   * Handles a single barcode and navigates to the correct screen.
   * @param barcode Scanned barcode
   * @returns true if the barcode has been handled, false otherwise
   */
  handleBarcode: (barcode: IOBarcode) => boolean;
};

/**
 * Hook that handles the barcodes from the camera scanner and the file scanner.
 * @returns @see IOBarcodesHandler
 */
export const useIOBarcodesHandler = (): IOBarcodesHandler => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();
  const openDeepLink = useOpenDeepLink();

  /**
   * Handles multiple pagoPA barcodes. If there is only one barcode, it is handled by handleBarcode function instead
   * @param barcodes Array of scanned pagoPA barcodes
   * @returns true if the barcodes have been handled, false otherwise
   */
  const handlePagoPaBarcodes = (
    pagoPABarcodes: Array<PagoPaBarcode>
  ): boolean => {
    if (pagoPABarcodes.length <= 1) {
      return handleBarcode(pagoPABarcodes[0]);
    }

    ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.notificationSuccess);

    const hasDataMatrix = pagoPABarcodes.some(
      barcode => barcode.format === "DATA_MATRIX"
    );

    const paymentStartOrigin: PaymentStartOrigin = hasDataMatrix
      ? "poste_datamatrix_scan"
      : "qrcode_scan";

    if (hasDataMatrix) {
      void mixpanelTrack("WALLET_SCAN_POSTE_DATAMATRIX_SUCCESS");
    }

    navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
      screen: WalletPaymentRoutes.WALLET_PAYMENT_BARCODE_CHOICE,
      params: {
        barcodes: pagoPABarcodes,
        paymentStartOrigin
      }
    });

    return true;
  };

  /**
   * Handles the case with multiple barcodes.It gives priority to pagoPA barcodes.
   * @param barcodes Array of scanned barcodes
   * @returns true if the barcodes have been handled, false otherwise
   */
  const handleMultipleBarcodes = (barcodes: Array<IOBarcode>): boolean => {
    const barcodesByType = getIOBarcodesByType(barcodes);

    if (barcodesByType.PAGOPA) {
      return handlePagoPaBarcodes(
        barcodesByType.PAGOPA as Array<PagoPaBarcode>
      );
    }

    return false;
  };

  /**
   * Handles a single barcode and navigates to the correct screen.
   * @param barcode Scanned barcode
   * @returns true if the barcode has been handled, false otherwise
   */
  const handleBarcode = (barcode: IOBarcode): boolean => {
    ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.notificationSuccess);

    switch (barcode.type) {
      case "IDPAY":
        openDeepLink(barcode.authUrl);
        return true;
      case "PAGOPA":
        dispatch(paymentInitializeState());

        const isDataMatrix = barcode.format === "DATA_MATRIX";

        if (isDataMatrix) {
          void mixpanelTrack("WALLET_SCAN_POSTE_DATAMATRIX_SUCCESS");
        }

        navigateToPaymentTransactionSummaryScreen({
          rptId: barcode.rptId,
          initialAmount: barcode.amount,
          paymentStartOrigin: isDataMatrix
            ? "poste_datamatrix_scan"
            : "qrcode_scan"
        });
        return true;
      default:
        return false;
    }
  };

  return {
    handleMultipleBarcodes,
    handleBarcode
  };
};

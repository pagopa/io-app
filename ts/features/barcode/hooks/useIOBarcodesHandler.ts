import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native";
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes
} from "react-native-haptic-feedback";
import { useOpenDeepLink } from "../../../hooks/useOpenDeepLink";
import I18n from "../../../i18n";
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

type IOBarcodesHandler = (barcodes: Array<IOBarcode>) => void;

/**
 * Hook that handles the barcodes from the camera scanner and the file scanner.
 * @returns @see IOBarcodesHandler a function that handles the barcodes and navigates to the correct screen
 */
export const useIOBarcodesHandler = (): IOBarcodesHandler => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();
  const openDeepLink = useOpenDeepLink();

  /**
   * Handles the case with multiple barcodes.It gives priority to pagoPA barcodes.
   * @param barcodes Array of scanned barcodes
   * @returns true if the barcodes have been handled, false otherwise
   */
  const handleMultipleBarcodes = (barcodes: Array<IOBarcode>): boolean => {
    const barcodesByType = getIOBarcodesByType(barcodes);

    if (barcodesByType.PAGOPA) {
      const pagoPABarcodes = barcodesByType.PAGOPA as Array<PagoPaBarcode>;

      ReactNativeHapticFeedback.trigger(
        HapticFeedbackTypes.notificationSuccess
      );

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
    }

    return false;
  };

  /**
   * Handles a single barcode and navigates to the correct screen.
   * @param barcode Scanned barcode
   */
  const handleSingleBarcode = (barcode: IOBarcode) => {
    ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.notificationSuccess);

    switch (barcode.type) {
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
        break;
      case "IDPAY":
        openDeepLink(barcode.authUrl);
        break;
    }
  };

  return (barcodes: Array<IOBarcode>) => {
    if (barcodes.length > 1 && !handleMultipleBarcodes(barcodes)) {
      // If the handle fails means that multiple barcodes for that type are not supported
      Alert.alert(
        I18n.t("barcodeScan.multipleResultsAlert.title"),
        I18n.t("barcodeScan.multipleResultsAlert.body"),
        [
          {
            text: I18n.t(`barcodeScan.multipleResultsAlert.action`),
            style: "default"
          }
        ],
        { cancelable: false }
      );
    } else if (barcodes.length > 0) {
      handleSingleBarcode(barcodes[0]);
    }
  };
};

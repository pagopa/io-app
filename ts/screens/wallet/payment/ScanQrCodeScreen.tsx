/**
 * The screen allows to identify a transaction by the QR code on the analogic notice
 */
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { ContextualHelpPropsMarkdown } from "../../../components/screens/BaseScreenComponent";
import {
  BarcodeFailure,
  BarcodeScanBaseScreenComponent,
  IOBarcode
} from "../../../features/barcode";
import I18n from "../../../i18n";
import { mixpanelTrack } from "../../../mixpanel";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { navigateToPaymentTransactionSummaryScreen } from "../../../store/actions/navigation";
import { paymentInitializeState } from "../../../store/actions/wallet/payment";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { barcodesScannerConfigSelector } from "../../../store/reducers/backendStatus";
import { showToast } from "../../../utils/showToast";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.QRtoPay.contextualHelpTitle",
  body: "wallet.QRtoPay.contextualHelpContent"
};

const ScanQrCodeScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();
  const { dataMatrixPosteEnabled } = useIOSelector(
    barcodesScannerConfigSelector
  );

  const handleBarcodeSuccess = (barcode: IOBarcode) => {
    if (barcode.type === "PAGOPA") {
      dispatch(paymentInitializeState());

      switch (barcode.format) {
        case "QR_CODE":
          navigateToPaymentTransactionSummaryScreen({
            rptId: barcode.rptId,
            initialAmount: barcode.amount,
            paymentStartOrigin: "qrcode_scan"
          });
          break;
        case "DATA_MATRIX":
          void mixpanelTrack("WALLET_SCAN_POSTE_DATAMATRIX_SUCCESS");

          navigateToPaymentTransactionSummaryScreen({
            rptId: barcode.rptId,
            initialAmount: barcode.amount,
            paymentStartOrigin: "poste_datamatrix_scan"
          });
          break;
      }
    } else {
      showToast(I18n.t("barcodeScan.error"), "danger", "top");
    }
  };

  const handleBarcodeError = (failure: BarcodeFailure) => {
    if (
      failure.reason === "UNKNOWN_CONTENT" &&
      failure.format === "DATA_MATRIX"
    ) {
      void mixpanelTrack("WALLET_SCAN_POSTE_DATAMATRIX_FAILURE");
    }
    showToast(I18n.t("barcodeScan.error"), "danger", "top");
  };

  const handleManualInputPressed = () =>
    navigation.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.PAYMENT_MANUAL_DATA_INSERTION,
      params: {}
    });

  return (
    <BarcodeScanBaseScreenComponent
      barcodeFormats={
        dataMatrixPosteEnabled ? ["QR_CODE", "DATA_MATRIX"] : ["QR_CODE"]
      }
      barcodeTypes={["PAGOPA"]}
      onBarcodeSuccess={handleBarcodeSuccess}
      onBarcodeError={handleBarcodeError}
      onManualInputPressed={handleManualInputPressed}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["wallet"]}
    />
  );
};

export default ScanQrCodeScreen;

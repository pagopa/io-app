/**
 * The screen allows to identify a transaction by the QR code on the analogic notice
 */
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes
} from "react-native-haptic-feedback";
import { IOToast } from "../../../../components/Toast";
import { ContextualHelpPropsMarkdown } from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { mixpanelTrack } from "../../../../mixpanel";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { navigateToPaymentTransactionSummaryScreen } from "../../../../store/actions/navigation";
import { paymentInitializeState } from "../../../../store/actions/wallet/payment";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { barcodesScannerConfigSelector } from "../../../../store/reducers/backendStatus";
import {
  BarcodeFailure,
  BarcodeScanBaseScreenComponent,
  IOBarcode
} from "../../../barcode";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.QRtoPay.contextualHelpTitle",
  body: "wallet.QRtoPay.contextualHelpContent"
};

const WalletPaymentBarcodeScanScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();
  const { dataMatrixPosteEnabled } = useIOSelector(
    barcodesScannerConfigSelector
  );

  const handleBarcodeSuccess = (barcodes: Array<IOBarcode>) => {
    ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.notificationSuccess);

    const barcode = barcodes[0];

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
    }
  };

  const handleBarcodeError = (failure: BarcodeFailure) => {
    if (
      failure.reason === "UNKNOWN_CONTENT" &&
      failure.format === "DATA_MATRIX"
    ) {
      void mixpanelTrack("WALLET_SCAN_POSTE_DATAMATRIX_FAILURE");
    }
    IOToast.error(I18n.t("barcodeScan.error"));
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

export { WalletPaymentBarcodeScanScreen };

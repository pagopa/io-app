import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes
} from "react-native-haptic-feedback";
import { Divider, ListItemNav, VSpacer } from "@pagopa/io-app-design-system";
import { IOToast } from "../../../components/Toast";
import { useOpenDeepLink } from "../../../hooks/useOpenDeepLink";
import I18n from "../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { navigateToPaymentTransactionSummaryScreen } from "../../../store/actions/navigation";
import { paymentInitializeState } from "../../../store/actions/wallet/payment";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import {
  barcodesScannerConfigSelector,
  isIdPayEnabledSelector
} from "../../../store/reducers/backendStatus";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import { IDPayPaymentRoutes } from "../../idpay/payment/navigation/navigator";
import { BarcodeScanBaseScreenComponent } from "../components/BarcodeScanBaseScreenComponent";
import {
  IOBarcode,
  IO_BARCODE_ALL_FORMATS,
  IO_BARCODE_ALL_TYPES
} from "../types/IOBarcode";
import { BarcodeFailure } from "../types/failure";
import { trackBarcodeScanFailure } from "../analytics";

const BarcodeScanScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();
  const openDeepLink = useOpenDeepLink();
  const isIdPayEnabled = useIOSelector(isIdPayEnabledSelector);

  const { dataMatrixPosteEnabled } = useIOSelector(
    barcodesScannerConfigSelector
  );

  const handleBarcodeSuccess = (barcodes: Array<IOBarcode>) => {
    // TODO: handle multiple barcodes (IOBP-170)
    const barcode = barcodes[0];

    ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.notificationSuccess);

    switch (barcode.type) {
      case "IDPAY":
        openDeepLink(barcode.authUrl);
        break;
      case "PAGOPA":
        dispatch(paymentInitializeState());

        navigateToPaymentTransactionSummaryScreen({
          rptId: barcode.rptId,
          initialAmount: barcode.amount,
          paymentStartOrigin:
            barcode.format === "QR_CODE"
              ? "qrcode_scan"
              : "poste_datamatrix_scan"
        });
        break;
    }
  };

  const handleBarcodeError = (failure: BarcodeFailure) => {
    IOToast.error(I18n.t("barcodeScan.error"));

    switch (failure.reason) {
      case "UNKNOWN_CONTENT":
        trackBarcodeScanFailure("home", "qr code flusso sbagliato");
        break;
      case "UNSUPPORTED_FORMAT":
      case "BARCODE_NOT_FOUND":
      case "INVALID_FILE":
        trackBarcodeScanFailure("home", "qr code non valido");
        break;
      default:
        break;
    }
  };

  const handleIdPayPaymentCodeInput = () => {
    manualInputModal.dismiss();
    navigation.navigate(IDPayPaymentRoutes.IDPAY_PAYMENT_MAIN, {
      screen: IDPayPaymentRoutes.IDPAY_PAYMENT_CODE_INPUT
    });
  };

  const handlePagoPACodeInput = () => {
    manualInputModal.dismiss();
    navigation.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.PAYMENT_MANUAL_DATA_INSERTION,
      params: {}
    });
  };

  const manualInputModalComponent = (
    <View>
      <ListItemNav
        value={I18n.t("barcodeScan.manual.notice")}
        accessibilityLabel={I18n.t("barcodeScan.manual.notice")}
        onPress={handlePagoPACodeInput}
        icon="gallery"
      />
      <Divider />
      <ListItemNav
        value={I18n.t("barcodeScan.manual.authorize")}
        accessibilityLabel={I18n.t("barcodeScan.manual.authorize")}
        onPress={handleIdPayPaymentCodeInput}
        icon="gallery"
      />
      <VSpacer size={16} />
    </View>
  );

  const manualInputModal = useIOBottomSheetAutoresizableModal({
    component: manualInputModalComponent,
    title: ""
  });

  const enabledFormats = IO_BARCODE_ALL_FORMATS.filter(
    format => !dataMatrixPosteEnabled && format === "DATA_MATRIX"
  );

  const enabledTypes = IO_BARCODE_ALL_TYPES.filter(
    type => !isIdPayEnabled && type === "IDPAY"
  );

  return (
    <>
      <BarcodeScanBaseScreenComponent
        barcodeFormats={enabledFormats}
        barcodeTypes={enabledTypes}
        onBarcodeSuccess={handleBarcodeSuccess}
        onBarcodeError={handleBarcodeError}
        onManualInputPressed={manualInputModal.present}
      />
      {manualInputModal.bottomSheet}
    </>
  );
};

export { BarcodeScanScreen };

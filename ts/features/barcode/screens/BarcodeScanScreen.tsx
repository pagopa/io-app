import { Divider, ListItemNav, VSpacer } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Alert, View } from "react-native";
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes
} from "react-native-haptic-feedback";
import { IOToast } from "../../../components/Toast";
import { useOpenDeepLink } from "../../../hooks/useOpenDeepLink";
import I18n from "../../../i18n";
import { mixpanelTrack } from "../../../mixpanel";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { navigateToPaymentTransactionSummaryScreen } from "../../../store/actions/navigation";
import { paymentInitializeState } from "../../../store/actions/wallet/payment";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import {
  barcodesScannerConfigSelector,
  isIdPayEnabledSelector
} from "../../../store/reducers/backendStatus";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import { IDPayPaymentRoutes } from "../../idpay/payment/navigation/navigator";
import { WalletPaymentRoutes } from "../../walletV3/payment/navigation/routes";
import * as analytics from "../analytics";
import { BarcodeScanBaseScreenComponent } from "../components/BarcodeScanBaseScreenComponent";
import { useIOBarcodeFileReader } from "../hooks/useIOBarcodeFileReader";
import {
  IOBarcode,
  IOBarcodeFormat,
  IOBarcodeOrigin,
  IOBarcodeType,
  IO_BARCODE_ALL_FORMATS,
  IO_BARCODE_ALL_TYPES,
  PagoPaBarcode
} from "../types/IOBarcode";
import { BarcodeFailure } from "../types/failure";
import { getIOBarcodesByType } from "../utils/getBarcodesByType";
import { WalletBarcodeRoutes } from "../../walletV3/barcode/navigation/routes";
import { useHardwareBackButton } from "../../../hooks/useHardwareBackButton";

const BarcodeScanScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();
  const openDeepLink = useOpenDeepLink();
  const isIdPayEnabled = useIOSelector(isIdPayEnabledSelector);

  useHardwareBackButton(() => {
    navigation.goBack();
    return true;
  });

  const { dataMatrixPosteEnabled } = useIOSelector(
    barcodesScannerConfigSelector
  );

  const barcodeFormats: Array<IOBarcodeFormat> = IO_BARCODE_ALL_FORMATS.filter(
    format => (format === "DATA_MATRIX" ? dataMatrixPosteEnabled : true)
  );

  const barcodeTypes: Array<IOBarcodeType> = IO_BARCODE_ALL_TYPES.filter(type =>
    type === "IDPAY" ? isIdPayEnabled : true
  );

  /**
   * Handles the case with multiple barcodes.It gives priority to pagoPA barcodes.
   * If barcode type does not support multiple barcode, it shows an alert.
   * @param barcodes Array of scanned barcodes
   */
  const handleMultipleBarcodes = (
    barcodes: Array<IOBarcode>,
    origin: IOBarcodeOrigin
  ) => {
    const barcodesByType = getIOBarcodesByType(barcodes);

    if (barcodesByType.PAGOPA) {
      const pagoPABarcodes = barcodesByType.PAGOPA as Array<PagoPaBarcode>;

      ReactNativeHapticFeedback.trigger(
        HapticFeedbackTypes.notificationSuccess
      );

      analytics.trackBarcodeScanSuccess("home", pagoPABarcodes[0], origin);

      const hasDataMatrix = pagoPABarcodes.some(
        barcode => barcode.format === "DATA_MATRIX"
      );

      if (hasDataMatrix) {
        void mixpanelTrack("WALLET_SCAN_POSTE_DATAMATRIX_SUCCESS");
      }

      navigation.navigate(WalletBarcodeRoutes.WALLET_BARCODE_MAIN, {
        screen: WalletBarcodeRoutes.WALLET_BARCODE_CHOICE,
        params: {
          barcodes: pagoPABarcodes
        }
      });
      return;
    }

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
  };

  /**
   * Handles a single barcode and navigates to the correct screen.
   * @param barcode Scanned barcode
   */
  const handleSingleBarcode = (barcode: IOBarcode, origin: IOBarcodeOrigin) => {
    ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.notificationSuccess);

    analytics.trackBarcodeScanSuccess("home", barcode, origin);

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

  const handleBarcodeSuccess = (
    barcodes: Array<IOBarcode>,
    origin: IOBarcodeOrigin
  ) => {
    if (barcodes.length > 1) {
      handleMultipleBarcodes(barcodes, origin);
    } else if (barcodes.length > 0) {
      handleSingleBarcode(barcodes[0], origin);
    }
  };

  const handleBarcodeError = (failure: BarcodeFailure) => {
    IOToast.error(I18n.t("barcodeScan.error"));
    analytics.trackBarcodeScanFailure("home", failure);
  };

  const handleIdPayPaymentCodeInput = () => {
    manualInputModal.dismiss();
    navigation.navigate(IDPayPaymentRoutes.IDPAY_PAYMENT_MAIN, {
      screen: IDPayPaymentRoutes.IDPAY_PAYMENT_CODE_INPUT
    });
  };

  const handlePagoPACodeInput = () => {
    manualInputModal.dismiss();
    navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
      screen: WalletPaymentRoutes.WALLET_PAYMENT_INPUT_NOTICE_NUMBER
    });
  };

  const manualInputModalComponent = (
    <View>
      <ListItemNav
        value={I18n.t("barcodeScan.manual.notice")}
        accessibilityLabel={I18n.t("barcodeScan.manual.notice")}
        onPress={handlePagoPACodeInput}
        icon="productPagoPA"
        iconColor="blueItalia-500"
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

  const handleManualInputPressed = () => {
    analytics.trackBarcodeManualEntryPath("home");

    if (isIdPayEnabled) {
      manualInputModal.present();
    } else {
      handlePagoPACodeInput();
    }
  };

  const {
    filePickerBottomSheet,
    showFilePicker,
    isLoading: isFileReaderLoading,
    isFilePickerVisible
  } = useIOBarcodeFileReader({
    barcodeFormats,
    barcodeTypes,
    onBarcodeSuccess: handleBarcodeSuccess,
    onBarcodeError: handleBarcodeError,
    barcodeAnalyticsFlow: "home"
  });

  return (
    <>
      <BarcodeScanBaseScreenComponent
        barcodeFormats={barcodeFormats}
        barcodeTypes={barcodeTypes}
        onBarcodeSuccess={handleBarcodeSuccess}
        onBarcodeError={handleBarcodeError}
        onFileInputPressed={showFilePicker}
        onManualInputPressed={handleManualInputPressed}
        contextualHelp={emptyContextualHelp}
        barcodeAnalyticsFlow="home"
        isLoading={isFileReaderLoading}
        isDisabled={isFilePickerVisible || isFileReaderLoading}
      />
      {filePickerBottomSheet}
      {manualInputModal.bottomSheet}
    </>
  );
};

export { BarcodeScanScreen };

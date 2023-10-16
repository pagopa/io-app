import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Alert, View } from "react-native";
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes
} from "react-native-haptic-feedback";
import { Divider, ListItemNav, VSpacer } from "@pagopa/io-app-design-system";
import { IOToast } from "../../../components/Toast";
import I18n from "../../../i18n";
import { mixpanelTrack } from "../../../mixpanel";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { navigateToPaymentTransactionSummaryScreen } from "../../../store/actions/navigation";
import {
  PaymentStartOrigin,
  paymentInitializeState
} from "../../../store/actions/wallet/payment";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import {
  barcodesScannerConfigSelector,
  isIdPayEnabledSelector
} from "../../../store/reducers/backendStatus";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import { IDPayPaymentRoutes } from "../../idpay/payment/navigation/navigator";
import { WalletPaymentRoutes } from "../../walletV3/payment/navigation/routes";
import { BarcodeScanBaseScreenComponent } from "../components/BarcodeScanBaseScreenComponent";
import {
  IOBarcode,
  IO_BARCODE_ALL_FORMATS,
  IO_BARCODE_ALL_TYPES,
  PagoPaBarcode
} from "../types/IOBarcode";
import { getIOBarcodesByType } from "../utils/getBarcodesByType";
import { useOpenDeepLink } from "../../../hooks/useOpenDeepLink";

const BarcodeScanScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();
  const openDeepLink = useOpenDeepLink();
  const isIdPayEnabled = useIOSelector(isIdPayEnabledSelector);

  const { dataMatrixPosteEnabled } = useIOSelector(
    barcodesScannerConfigSelector
  );

  /**
   * Handles the case with multiple barcodes.It gives priority to pagoPA barcodes.
   * If barcode type does not support multiple barcode, it shows an alert.
   * @param barcodes Array of scanned barcodes
   */
  const handleMultipleBarcodes = (barcodes: Array<IOBarcode>) => {
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

  const handleBarcodeSuccess = (barcodes: Array<IOBarcode>) => {
    if (barcodes.length > 1) {
      handleMultipleBarcodes(barcodes);
    } else if (barcodes.length > 0) {
      handleSingleBarcode(barcodes[0]);
    }
  };

  const handleBarcodeError = () => {
    IOToast.error(I18n.t("barcodeScan.error"));
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

  const handleManualInputPressed = () => {
    if (isIdPayEnabled) {
      manualInputModal.present();
    } else {
      handlePagoPACodeInput();
    }
  };

  const enabledFormats = IO_BARCODE_ALL_FORMATS.filter(format => {
    switch (format) {
      case "DATA_MATRIX":
        return dataMatrixPosteEnabled;
      default:
        return true;
    }
  });

  const enabledTypes = IO_BARCODE_ALL_TYPES.filter(type => {
    switch (type) {
      case "IDPAY":
        return isIdPayEnabled;
      default:
        return true;
    }
  });

  return (
    <>
      <BarcodeScanBaseScreenComponent
        barcodeFormats={enabledFormats}
        barcodeTypes={enabledTypes}
        onBarcodeSuccess={handleBarcodeSuccess}
        onBarcodeError={handleBarcodeError}
        onManualInputPressed={handleManualInputPressed}
        contextualHelp={emptyContextualHelp}
      />
      {manualInputModal.bottomSheet}
    </>
  );
};

export { BarcodeScanScreen };

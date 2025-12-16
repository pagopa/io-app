import {
  Divider,
  IOToast,
  ListItemNav,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import I18n from "i18next";
import { Alert, View } from "react-native";
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes
} from "react-native-haptic-feedback";
import { useHardwareBackButton } from "../../../hooks/useHardwareBackButton";
import { useOpenDeepLink } from "../../../hooks/useOpenDeepLink";
import { mixpanelTrack } from "../../../mixpanel";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import {
  barcodesScannerConfigSelector,
  isIdPayEnabledInScanScreenSelector,
  isPnRemoteEnabledSelector
} from "../../../store/reducers/backendStatus/remoteConfig";
import { emptyContextualHelp } from "../../../utils/contextualHelp.ts";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { FCI_ROUTES } from "../../fci/navigation/routes";
import { IdPayPaymentRoutes } from "../../idpay/payment/navigation/routes";
import { ITW_REMOTE_ROUTES } from "../../itwallet/presentation/remote/navigation/routes.ts";
import { MESSAGES_ROUTES } from "../../messages/navigation/routes.ts";
import { PaymentsBarcodeRoutes } from "../../payments/barcode/navigation/routes";
import { usePagoPaPayment } from "../../payments/checkout/hooks/usePagoPaPayment";
import { PaymentsCheckoutRoutes } from "../../payments/checkout/navigation/routes";
import { paymentAnalyticsDataSelector } from "../../payments/history/store/selectors";
import * as paymentsAnalytics from "../../payments/home/analytics";
import PN_ROUTES from "../../pn/navigation/routes.ts";
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

const BarcodeScanScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const openDeepLink = useOpenDeepLink();
  const isIdPayEnabledInScanScreen = useIOSelector(
    isIdPayEnabledInScanScreenSelector
  );
  const paymentAnalyticsData = useIOSelector(paymentAnalyticsDataSelector);
  const isSendEnabled = useIOSelector(isPnRemoteEnabledSelector);

  const { startPaymentFlowWithRptId } = usePagoPaPayment();

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
    type === "IDPAY"
      ? isIdPayEnabledInScanScreen
      : type === "SEND"
      ? isSendEnabled
      : true
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

      navigation.navigate(PaymentsBarcodeRoutes.PAYMENT_BARCODE_NAVIGATOR, {
        screen: PaymentsBarcodeRoutes.PAYMENT_BARCODE_CHOICE,
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
        const isDataMatrix = barcode.format === "DATA_MATRIX";

        if (isDataMatrix) {
          void mixpanelTrack("WALLET_SCAN_POSTE_DATAMATRIX_SUCCESS");
        }

        startPaymentFlowWithRptId(barcode.rptId, {
          onSuccess: "showTransaction",
          startOrigin: isDataMatrix ? "poste_datamatrix_scan" : "qrcode_scan"
        });

        break;
      case "IDPAY":
        openDeepLink(barcode.authUrl);
        break;
      case "FCI":
        navigation.navigate(FCI_ROUTES.MAIN, {
          screen: FCI_ROUTES.ROUTER,
          params: {
            signatureRequestId: barcode.signatureRequestId
          }
        });
        break;
      case "ITW_REMOTE":
        navigation.navigate(ITW_REMOTE_ROUTES.MAIN, {
          screen: ITW_REMOTE_ROUTES.REQUEST_VALIDATION,
          params: barcode.itwRemoteRequestPayload
        });
        break;
      case "SEND":
        navigation.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
          screen: PN_ROUTES.MAIN,
          params: {
            screen: PN_ROUTES.QR_SCAN_FLOW,
            params: { aarUrl: barcode.qrCodeContent }
          }
        });
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
    navigation.navigate(IdPayPaymentRoutes.IDPAY_PAYMENT_MAIN, {
      screen: IdPayPaymentRoutes.IDPAY_PAYMENT_CODE_INPUT
    });
  };

  const handlePagoPACodeInput = () => {
    manualInputModal.dismiss();
    paymentsAnalytics.trackPaymentStartDataEntry({
      saved_payment_method:
        paymentAnalyticsData?.savedPaymentMethods?.length ?? 0
    });
    navigation.navigate(PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR, {
      screen: PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_INPUT_NOTICE_NUMBER
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

  const manualInputModal = useIOBottomSheetModal({
    component: manualInputModalComponent,
    title: ""
  });

  const handleManualInputPressed = () => {
    analytics.trackBarcodeManualEntryPath("home");

    if (isIdPayEnabledInScanScreen) {
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

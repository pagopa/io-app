import { IOToast } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native";
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes
} from "react-native-haptic-feedback";
import I18n from "i18next";
import { useOpenDeepLink } from "../../../../hooks/useOpenDeepLink";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import {
  BarcodeFailure,
  BarcodeScanBaseScreenComponent,
  IOBarcode,
  IOBarcodeFormat,
  IOBarcodeType,
  useIOBarcodeFileReader
} from "../../../barcode";
import * as analytics from "../../../barcode/analytics";
import { IOBarcodeOrigin } from "../../../barcode/types/IOBarcode";
import { IdPayPaymentRoutes } from "../navigation/routes";
import { IdPayFeatureFlagGuard } from "../../common/components/IdPayFeatureFlagGuard";

const IDPayPaymentCodeScan = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const openDeepLink = useOpenDeepLink();

  const barcodeFormats: Array<IOBarcodeFormat> = ["QR_CODE"];
  const barcodeTypes: Array<IOBarcodeType> = ["IDPAY"];

  const handleBarcodeSuccess = (
    barcodes: Array<IOBarcode>,
    origin: IOBarcodeOrigin
  ) => {
    if (barcodes.length > 1) {
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
      return;
    }

    const barcode = barcodes[0];

    ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.notificationSuccess);

    analytics.trackBarcodeScanSuccess("idpay", barcode, origin);

    if (barcode.type === "IDPAY") {
      openDeepLink(barcode.authUrl);
    }
  };

  const handleBarcodeError = (failure: BarcodeFailure) => {
    IOToast.error(I18n.t("barcodeScan.error"));
    analytics.trackBarcodeScanFailure("idpay", failure);
  };

  const navigateToCodeInputScreen = () => {
    analytics.trackBarcodeManualEntryPath("idpay");
    navigation.navigate(IdPayPaymentRoutes.IDPAY_PAYMENT_MAIN, {
      screen: IdPayPaymentRoutes.IDPAY_PAYMENT_CODE_INPUT
    });
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
    barcodeAnalyticsFlow: "idpay"
  });

  return (
    <>
      <BarcodeScanBaseScreenComponent
        barcodeFormats={barcodeFormats}
        barcodeTypes={barcodeTypes}
        onBarcodeSuccess={handleBarcodeSuccess}
        onBarcodeError={handleBarcodeError}
        onFileInputPressed={showFilePicker}
        onManualInputPressed={navigateToCodeInputScreen}
        contextualHelp={emptyContextualHelp}
        barcodeAnalyticsFlow="idpay"
        isDisabled={isFilePickerVisible || isFileReaderLoading}
        isLoading={isFileReaderLoading}
      />
      {filePickerBottomSheet}
    </>
  );
};

const IDPayPaymentCodeScanScreen = () => (
  <IdPayFeatureFlagGuard>
    <IDPayPaymentCodeScan />
  </IdPayFeatureFlagGuard>
);

export { IDPayPaymentCodeScanScreen };

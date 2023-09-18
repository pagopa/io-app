import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Alert } from "react-native";
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes
} from "react-native-haptic-feedback";
import { IOToast } from "../../../../components/Toast";
import { useOpenDeepLink } from "../../../../hooks/useOpenDeepLink";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { BarcodeScanBaseScreenComponent, IOBarcode } from "../../../barcode";
import { IDPayPaymentRoutes } from "../navigation/navigator";

const IDPayPaymentCodeScanScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const openDeepLink = useOpenDeepLink();

  const handleBarcodeSuccess = (barcodes: Array<IOBarcode>) => {
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

    if (barcode.type === "IDPAY") {
      openDeepLink(barcode.authUrl);
    }
  };

  const handleBarcodeError = () => {
    IOToast.error(I18n.t("barcodeScan.error"));
  };

  const navigateToCodeInputScreen = () =>
    navigation.navigate(IDPayPaymentRoutes.IDPAY_PAYMENT_MAIN, {
      screen: IDPayPaymentRoutes.IDPAY_PAYMENT_CODE_INPUT
    });

  return (
    <BarcodeScanBaseScreenComponent
      barcodeFormats={["QR_CODE"]}
      barcodeTypes={["IDPAY"]}
      onBarcodeSuccess={handleBarcodeSuccess}
      onBarcodeError={handleBarcodeError}
      onManualInputPressed={navigateToCodeInputScreen}
    />
  );
};

export { IDPayPaymentCodeScanScreen };

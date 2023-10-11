import { useFocusEffect, useNavigation } from "@react-navigation/native";
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
import {
  BarcodeFailure,
  BarcodeScanBaseScreenComponent,
  IOBarcode
} from "../../../barcode";
import { IDPayPaymentRoutes } from "../navigation/navigator";
import * as analytics from "../../../barcode/analytics";
import { IOBarcodeOrigin } from "../../../barcode/types/IOBarcode";

const IDPayPaymentCodeScanScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const openDeepLink = useOpenDeepLink();

  useFocusEffect(() => {
    analytics.trackBarcodeScanScreenView("idpay");
  });

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

    analytics.trackBarcodeScanSuccess("home", barcode, origin);

    if (barcode.type === "IDPAY") {
      openDeepLink(barcode.authUrl);
    }
  };

  const handleBarcodeError = (failure: BarcodeFailure) => {
    IOToast.error(I18n.t("barcodeScan.error"));
    analytics.trackBarcodeScanFailure("idpay", failure);
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

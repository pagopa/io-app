import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useOpenDeepLink } from "../../../../hooks/useOpenDeepLink";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { showToast } from "../../../../utils/showToast";
import { BarcodeScanBaseScreenComponent, IOBarcode } from "../../../barcode";
import { IDPayPaymentRoutes } from "../navigation/navigator";

const IDPayPaymentCodeScanScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const openDeepLink = useOpenDeepLink();

  const handleBarcodeSuccess = (barcode: IOBarcode) => {
    if (barcode.type === "UNKNOWN") {
      return handleBarcodeError();
    }

    if (barcode.type === "IDPAY") {
      openDeepLink(barcode.authUrl);
    }
  };

  const handleBarcodeError = () => {
    showToast(I18n.t("idpay.payment.qrCode.scan.error"), "danger", "top");
  };

  const navigateToCodeInputScreen = () =>
    navigation.navigate(IDPayPaymentRoutes.IDPAY_PAYMENT_MAIN, {
      screen: IDPayPaymentRoutes.IDPAY_PAYMENT_CODE_INPUT
    });

  return (
    <BarcodeScanBaseScreenComponent
      formats={["QR_CODE"]}
      onBarcodeSuccess={handleBarcodeSuccess}
      onBarcodeError={handleBarcodeError}
      onManualInputPressed={navigateToCodeInputScreen}
    />
  );
};

export { IDPayPaymentCodeScanScreen };

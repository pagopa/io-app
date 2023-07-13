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
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";

const IDPayPaymentCodeScanScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const openDeepLink = useOpenDeepLink();

  const handleBarcodeSuccess = (barcode: IOBarcode) => {
    if (barcode.type === "IDPAY") {
      openDeepLink(barcode.authUrl);
    } else {
      handleBarcodeError();
    }
  };

  const handleBarcodeError = () => {
    showToast(I18n.t("barcodeScan.error"), "danger", "top");
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
      contextualHelp={emptyContextualHelp}
    />
  );
};

export { IDPayPaymentCodeScanScreen };

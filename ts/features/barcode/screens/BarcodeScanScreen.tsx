import { useNavigation } from "@react-navigation/native";
import React from "react";
import { SafeAreaView } from "react-native";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import ListItemNav from "../../../components/ui/ListItemNav";
import { useOpenDeepLink } from "../../../hooks/useOpenDeepLink";
import I18n from "../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import { IDPayPaymentRoutes } from "../../idpay/payment/navigation/navigator";
import { BarcodeScanBaseScreenComponent } from "../components/BarcodeScanBaseScreenComponent";
import { IOBarcode } from "../types/IOBarcode";
import { showToast } from "../../../utils/showToast";
import { BarcodeFailure } from "../types/failure";

const BarcodeScanScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const openDeepLink = useOpenDeepLink();

  const handleBarcodeSuccess = (barcode: IOBarcode) => {
    if (barcode.type === "IDPAY") {
      openDeepLink(barcode.authUrl);
    }
  };

  const handleBarcodeError = (_: BarcodeFailure) => {
    showToast(I18n.t("barcodeScan.error"), "danger", "top");
  };

  const handleIdPayPaymentCodeInput = () => {
    manualInputModal.dismiss();
    navigation.navigate(IDPayPaymentRoutes.IDPAY_PAYMENT_MAIN, {
      screen: IDPayPaymentRoutes.IDPAY_PAYMENT_CODE_INPUT
    });
  };

  const manualInputModalComponent = (
    <SafeAreaView>
      <ListItemNav
        value={I18n.t("barcodeScan.manual.authorize")}
        accessibilityLabel={I18n.t("barcodeScan.manual.authorize")}
        onPress={handleIdPayPaymentCodeInput}
        icon="gallery"
      />
      <VSpacer size={16} />
    </SafeAreaView>
  );

  const manualInputModal = useIOBottomSheetAutoresizableModal({
    component: manualInputModalComponent,
    title: ""
  });

  return (
    <>
      <BarcodeScanBaseScreenComponent
        onBarcodeSuccess={handleBarcodeSuccess}
        onBarcodeError={handleBarcodeError}
        onManualInputPressed={manualInputModal.present}
      />
      {manualInputModal.bottomSheet}
    </>
  );
};

export { BarcodeScanScreen };

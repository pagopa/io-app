import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import ListItemNav from "../../../components/ui/ListItemNav";
import { useOpenDeepLink } from "../../../hooks/useOpenDeepLink";
import I18n from "../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import * as Platform from "../../../utils/platform";
import { showToast } from "../../../utils/showToast";
import { IDPayPaymentRoutes } from "../../idpay/payment/navigation/navigator";
import { BarcodeScanBaseScreenComponent } from "../components/BarcodeScanBaseScreenComponent";
import { IOBarcode } from "../types/IOBarcode";
import { BarcodeFailure } from "../types/failure";

const BarcodeScanScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const openDeepLink = useOpenDeepLink();
  const insets = useSafeAreaInsets();

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
    <View>
      <ListItemNav
        value={I18n.t("barcodeScan.manual.authorize")}
        accessibilityLabel={I18n.t("barcodeScan.manual.authorize")}
        onPress={handleIdPayPaymentCodeInput}
        icon="gallery"
      />
      <VSpacer size={16} />
    </View>
  );

  const manualInputModal = useIOBottomSheetAutoresizableModal(
    {
      component: manualInputModalComponent,
      title: ""
    },
    // FIXME: This is a workaround to avoid the bottom sheet to be hidden on Android
    32 + (Platform.isAndroid ? insets.bottom : 0)
  );

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

import { Divider, ListItemNav, VSpacer } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { idPayGenerateBarcode } from "../../barcode/store/actions";
import { IdPayPaymentRoutes } from "../../payment/navigation/routes";
import I18n from "../../../../i18n";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { idPayBarcodeSecondsTillExpireSelector } from "../../barcode/store";
import { IdPayBarcodeRoutes } from "../../barcode/navigation/routes";

export const useIdPayDiscountDetailsBottomSheet = (initiativeId: string) => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const barcodeSecondsSelector = useIOSelector(
    idPayBarcodeSecondsTillExpireSelector
  );
  const dispatch = useIODispatch();

  const navigateToPaymentAuthorization = () => {
    navigation.navigate(IdPayPaymentRoutes.IDPAY_PAYMENT_CODE_SCAN);
  };

  const barcodePressHandler = () => {
    const isBarcodeAvailable = barcodeSecondsSelector(initiativeId) > 0;
    if (!isBarcodeAvailable) {
      dispatch(idPayGenerateBarcode.request({ initiativeId }));
    }
    bottomSheet.dismiss();
    navigation.navigate(IdPayBarcodeRoutes.IDPAY_BARCODE_MAIN, {
      screen: IdPayBarcodeRoutes.IDPAY_BARCODE_RESULT,
      params: { initiativeId }
    });
  };

  const DiscountInitiativeBottomSheetContent = () => (
    <>
      <ListItemNav
        value={I18n.t(
          "idpay.initiative.discountDetails.bottomSheetOptions.scanQr"
        )}
        icon="qrCode"
        onPress={() => {
          bottomSheet.dismiss();
          navigateToPaymentAuthorization();
        }}
        accessibilityLabel={I18n.t(
          "idpay.initiative.discountDetails.bottomSheetOptions.scanQr"
        )}
      />
      <Divider />
      <ListItemNav
        icon="barcode"
        value={I18n.t(
          "idpay.initiative.discountDetails.bottomSheetOptions.generateBarcode"
        )}
        onPress={barcodePressHandler}
        accessibilityLabel={I18n.t(
          "idpay.initiative.discountDetails.bottomSheetOptions.generateBarcode"
        )}
      />
      <Divider />
      <VSpacer size={24} />
    </>
  );

  const bottomSheet = useIOBottomSheetAutoresizableModal({
    component: <DiscountInitiativeBottomSheetContent />,
    title: null
  });

  return bottomSheet;
};

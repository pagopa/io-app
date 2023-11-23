import { Divider, ListItemNav, VSpacer } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { idPayGenerateBarcode } from "../../barcode/store/actions";
import { IDPayPaymentRoutes } from "../../payment/navigation/navigator";
import I18n from "../../../../i18n";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";

export const useIdPayDiscountDetailsBottomSheet = (initiativeId: string) => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const navigateToPaymentAuthorization = () => {
    navigation.navigate(IDPayPaymentRoutes.IDPAY_PAYMENT_CODE_SCAN);
  };
  const dispatch = useIODispatch();
  const barcodePressHandler = () => {
    dispatch(idPayGenerateBarcode.request({ initiativeId }));
    bottomSheet.dismiss();
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

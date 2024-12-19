import { View } from "react-native";
import { FeatureInfo, H4, VSpacer } from "@pagopa/io-app-design-system";
import {
  IOBottomSheetModal,
  useIOBottomSheetAutoresizableModal
} from "../../../../utils/hooks/bottomSheet";
import I18n from "../../../../i18n";

/**
 * This custom hook, useIdPayInfoCieBottomSheet, is designed to display a bottom sheet
 * containing detailed information about how the CIE (Carta d'Identità Elettronica) payment authorization works.
 */
const useIdPayInfoCieBottomSheet = (): IOBottomSheetModal => {
  const getModalContent = () => (
    <View>
      <FeatureInfo
        iconName="contactless"
        body={I18n.t("idpay.initiative.cie.bottomSheet.featureOne")}
      />
      <VSpacer size={24} />
      <FeatureInfo
        iconName="keyboard"
        body={I18n.t("idpay.initiative.cie.bottomSheet.featureTwo")}
      />
      <VSpacer size={24} />
      <FeatureInfo
        iconName="change"
        body={I18n.t("idpay.initiative.cie.bottomSheet.featureThree")}
      />
      <VSpacer size={24} />
    </View>
  );

  const modal = useIOBottomSheetAutoresizableModal({
    component: getModalContent(),
    title: <H4>{I18n.t("idpay.initiative.cie.bottomSheet.title")}</H4>
  });

  return { ...modal };
};

export { useIdPayInfoCieBottomSheet };

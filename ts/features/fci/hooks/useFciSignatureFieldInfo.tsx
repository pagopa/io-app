import { Body } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";

/**
 * A hook that returns a function to present an info bottom sheet
 */
export const useFciSignatureFieldInfo = () => {
  const { present, bottomSheet, dismiss } = useIOBottomSheetModal({
    title: I18n.t("features.fci.signatureFieldInfo.title"),
    component: (
      <Body>{I18n.t("features.fci.signatureFieldInfo.subTitle")}</Body>
    ),
    snapPoint: [300]
  });

  return {
    dismiss,
    present,
    bottomSheet
  };
};

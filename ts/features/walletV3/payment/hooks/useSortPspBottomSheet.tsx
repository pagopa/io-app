import React from "react";
import { Divider, ListItemNav, VSpacer } from "@pagopa/io-app-design-system";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import I18n from "../../../../i18n";
import { WalletPaymentPspSortType } from "../types";

type WalletPaymentSortPspBottomSheetProps = {
  onSortChange: (sortType: WalletPaymentPspSortType) => void;
};

/**
 * This custom hook, useSortPspBottomSheet, is designed to display a bottom sheet
 * containing detailed information about how the CIE (Carta d'Identità Elettronica) payment authorization works.
 */
const useSortPspBottomSheet = ({
  onSortChange
}: WalletPaymentSortPspBottomSheetProps) => {
  const getModalContent = () => (
    <>
      <ListItemNav
        hideChevron
        accessibilityLabel={I18n.t(
          "wallet.payment.psp.sortBottomSheet.default"
        )}
        value={I18n.t("wallet.payment.psp.sortBottomSheet.default")}
        onPress={() => onSortChange("default")}
      />
      <Divider />
      <ListItemNav
        hideChevron
        accessibilityLabel={I18n.t("wallet.payment.psp.sortBottomSheet.name")}
        value={I18n.t("wallet.payment.psp.sortBottomSheet.name")}
        onPress={() => onSortChange("name")}
      />
      <Divider />
      <ListItemNav
        hideChevron
        accessibilityLabel={I18n.t("wallet.payment.psp.sortBottomSheet.amount")}
        value={I18n.t("wallet.payment.psp.sortBottomSheet.amount")}
        onPress={() => onSortChange("amount")}
      />
      <VSpacer size={24} />
    </>
  );

  const modal = useIOBottomSheetAutoresizableModal({
    component: getModalContent(),
    title: ""
  });

  return { ...modal };
};

export { useSortPspBottomSheet };

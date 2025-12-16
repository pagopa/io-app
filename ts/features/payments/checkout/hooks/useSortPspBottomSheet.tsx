import { useState } from "react";
import { RadioGroup, RadioItem } from "@pagopa/io-app-design-system";
import { AccessibilityInfo } from "react-native";
import I18n from "i18next";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { WalletPaymentPspSortType } from "../types";

const sortPspListOptions: Array<RadioItem<WalletPaymentPspSortType>> = [
  {
    id: "default",
    value: I18n.t("wallet.payment.psp.sortBottomSheet.default"),
    accessibilityLabel: I18n.t(
      "wallet.payment.psp.sortBottomSheet.a11y.default"
    )
  },
  {
    id: "name",
    value: I18n.t("wallet.payment.psp.sortBottomSheet.name"),
    accessibilityLabel: I18n.t("wallet.payment.psp.sortBottomSheet.a11y.name")
  },
  {
    id: "amount",
    value: I18n.t("wallet.payment.psp.sortBottomSheet.amount"),
    accessibilityLabel: I18n.t("wallet.payment.psp.sortBottomSheet.a11y.amount")
  }
];

type WalletPaymentSortPspBottomSheetProps = {
  onSortChange: (sortType: WalletPaymentPspSortType) => void;
};

/**
 * This custom hook, useSortPspBottomSheet, is designed to display a bottom sheet
 * with the sorting options for the PSPs.
 */
const useSortPspBottomSheet = ({
  onSortChange
}: WalletPaymentSortPspBottomSheetProps) => {
  const [sortType, setSortType] = useState<WalletPaymentPspSortType>("default");

  const handleChangeSort = (changedSortType: WalletPaymentPspSortType) => {
    setSortType(changedSortType);
    onSortChange(changedSortType);
  };

  const present = () => {
    modal.present();
    AccessibilityInfo.announceForAccessibility(
      I18n.t("wallet.payment.psp.sortBottomSheet.a11y.announce")
    );
  };

  const getModalContent = () => (
    <RadioGroup<WalletPaymentPspSortType>
      onPress={handleChangeSort}
      type="radioListItem"
      selectedItem={sortType}
      items={sortPspListOptions}
    />
  );

  const modal = useIOBottomSheetModal({
    component: getModalContent(),
    title: ""
  });

  return { sortType, ...modal, present };
};

export { useSortPspBottomSheet };

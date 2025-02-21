import { useState } from "react";
import { RadioGroup, RadioItem } from "@pagopa/io-app-design-system";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { WalletPaymentPspSortType } from "../types";
import I18n from "../../../../i18n";

const sortPspListOptions: Array<RadioItem<WalletPaymentPspSortType>> = [
  {
    id: "default",
    value: I18n.t("wallet.payment.psp.sortBottomSheet.default")
  },
  {
    id: "name",
    value: I18n.t("wallet.payment.psp.sortBottomSheet.name")
  },
  {
    id: "amount",
    value: I18n.t("wallet.payment.psp.sortBottomSheet.amount")
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

  const handleChangeSort = (sortType: WalletPaymentPspSortType) => {
    setSortType(sortType);
    onSortChange(sortType);
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

  return { sortType, ...modal };
};

export { useSortPspBottomSheet };

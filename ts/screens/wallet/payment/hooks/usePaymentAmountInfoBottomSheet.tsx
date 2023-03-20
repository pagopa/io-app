import React from "react";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { Body } from "../../../../components/core/typography/Body";
import I18n from "../../../../i18n";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { IOColors } from "../../../../components/core/variables/IOColors";

export const usePaymentAmountInfoBottomSheet = () => {
  const { present, bottomSheet, dismiss } = useIOBottomSheetModal(
    <Body>{I18n.t("wallet.firstTransactionSummary.amountInfo.message")}</Body>,
    I18n.t("wallet.firstTransactionSummary.amountInfo.title"),
    260,
    <FooterWithButtons
      type={"SingleButton"}
      leftButton={{
        block: true,
        light: false,
        labelColor: IOColors.white,
        bordered: false,
        onPress: () => dismiss(),
        title: I18n.t("wallet.firstTransactionSummary.amountInfo.cta")
      }}
    />
  );

  return {
    presentPaymentInfoBottomSheet: present,
    paymentInfoBottomSheet: bottomSheet
  };
};

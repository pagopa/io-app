import React from "react";
import { Body } from "../../../../components/core/typography/Body";
import { IOColors } from "../../../../components/core/variables/IOColors";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";

export const usePaymentAmountInfoBottomSheet = () => {
  const { present, bottomSheet, dismiss } = useIOBottomSheetAutoresizableModal(
    {
      component: (
        <Body>
          {I18n.t("wallet.firstTransactionSummary.amountInfo.message")}
        </Body>
      ),
      title: I18n.t("wallet.firstTransactionSummary.amountInfo.title"),
      footer: (
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
      )
    },
    130
  );

  return {
    presentPaymentInfoBottomSheet: present,
    paymentInfoBottomSheet: bottomSheet
  };
};

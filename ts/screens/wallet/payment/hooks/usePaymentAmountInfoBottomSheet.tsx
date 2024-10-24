import React from "react";
import { View } from "react-native";
import { Body, FooterWithButtons } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";

/**
 * @deprecated Marked as to be deleted
 */
export const usePaymentAmountInfoBottomSheet = () => {
  const { present, bottomSheet, dismiss } = useIOBottomSheetAutoresizableModal(
    {
      title: I18n.t("wallet.firstTransactionSummary.amountInfo.title"),
      component: (
        <Body>
          {I18n.t("wallet.firstTransactionSummary.amountInfo.message")}
        </Body>
      ),
      footer: (
        <View>
          <FooterWithButtons
            type={"SingleButton"}
            primary={{
              type: "Solid",
              buttonProps: {
                label: I18n.t("wallet.firstTransactionSummary.amountInfo.cta"),
                accessibilityLabel: I18n.t(
                  "wallet.firstTransactionSummary.amountInfo.cta"
                ),
                onPress: () => dismiss()
              }
            }}
          />
        </View>
      )
    },
    200
  );

  return {
    presentPaymentInfoBottomSheet: present,
    paymentInfoBottomSheet: bottomSheet
  };
};

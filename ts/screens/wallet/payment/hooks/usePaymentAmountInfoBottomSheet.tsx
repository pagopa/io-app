import React from "react";
import { View } from "react-native";
import { FooterWithButtons } from "@pagopa/io-app-design-system";
import { Body } from "../../../../components/core/typography/Body";
import I18n from "../../../../i18n";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";

export const usePaymentAmountInfoBottomSheet = () => {
  const { present, bottomSheet, dismiss } = useIOBottomSheetModal({
    title: I18n.t("wallet.firstTransactionSummary.amountInfo.title"),
    component: (
      <Body>{I18n.t("wallet.firstTransactionSummary.amountInfo.message")}</Body>
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
  });

  return {
    presentPaymentInfoBottomSheet: present,
    paymentInfoBottomSheet: bottomSheet
  };
};

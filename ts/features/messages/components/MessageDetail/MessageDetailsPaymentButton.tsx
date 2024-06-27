import React from "react";
import { ButtonSolid, useIOToast } from "@pagopa/io-app-design-system";
import { PaymentData, UIMessageId } from "../../types";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import I18n from "../../../../i18n";
import {
  getRptIdStringFromPaymentData,
  initializeAndNavigateToWalletForPayment
} from "../../utils";
import { isNewPaymentSectionEnabledSelector } from "../../../../store/reducers/backendStatus";

type MessageDetailsPaymentButtonProps = {
  messageId: UIMessageId;
  paymentData: PaymentData;
  canNavigateToPayment: boolean;
  isLoading: boolean;
};

export const MessageDetailsPaymentButton = ({
  messageId,
  paymentData,
  canNavigateToPayment,
  isLoading
}: MessageDetailsPaymentButtonProps) => {
  const dispatch = useIODispatch();
  const toast = useIOToast();
  // Checks if the new wallet section is enabled
  const isNewWalletSectionEnabled = useIOSelector(
    isNewPaymentSectionEnabledSelector
  );
  return (
    <ButtonSolid
      label={I18n.t("features.messages.payments.pay")}
      accessibilityLabel={I18n.t("features.messages.payments.pay")}
      onPress={() =>
        initializeAndNavigateToWalletForPayment(
          isNewWalletSectionEnabled,
          messageId,
          getRptIdStringFromPaymentData(paymentData),
          false,
          paymentData.amount,
          canNavigateToPayment,
          dispatch,
          false,
          () => toast.error(I18n.t("genericError"))
        )
      }
      fullWidth
      loading={isLoading}
    />
  );
};

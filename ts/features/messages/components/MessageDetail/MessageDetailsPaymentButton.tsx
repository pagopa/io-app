import React from "react";
import { ButtonSolid, useIOToast } from "@pagopa/io-app-design-system";
import { PaymentData, UIMessageId } from "../../types";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import I18n from "../../../../i18n";
import {
  getRptIdStringFromPaymentData,
  initializeAndNavigateToWalletForPayment
} from "../../utils";
import { isNewPaymentSectionEnabledSelector } from "../../../../store/reducers/backendStatus";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { computeAndTrackPaymentStart } from "./detailsUtils";

type MessageDetailsPaymentButtonProps = {
  messageId: UIMessageId;
  paymentData: PaymentData;
  canNavigateToPayment: boolean;
  isLoading: boolean;
  serviceId: ServiceId;
};

export const MessageDetailsPaymentButton = ({
  messageId,
  paymentData,
  canNavigateToPayment,
  isLoading,
  serviceId
}: MessageDetailsPaymentButtonProps) => {
  const dispatch = useIODispatch();
  const store = useIOStore();
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
          () => computeAndTrackPaymentStart(serviceId, store.getState()),
          () => toast.error(I18n.t("genericError"))
        )
      }
      fullWidth
      loading={isLoading}
    />
  );
};

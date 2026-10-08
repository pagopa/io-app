import { NotificationPaymentInfo } from "@io-app/api-types/generated/definitions/pn/NotificationPaymentInfo";
import { FooterActions, useIOToast } from "@io-app/design-system";
import I18n from "i18next";
import { ComponentProps, RefObject, useCallback } from "react";
import { useDispatch } from "react-redux";

import { useIOSelector } from "../../../store/hooks";
import { canNavigateToPaymentFromMessageSelector } from "../../messages/store/reducers/payments";
import { initializeAndNavigateToWalletForPayment } from "../../messages/utils";
import {
  SendOpeningSource,
  SendUserType
} from "../../pushNotifications/analytics";
import { trackPNPaymentStart, trackPNShowAllPayments } from "../analytics";
import { paymentsButtonStateSelector } from "../store/reducers/payments";
import { shouldUseBottomSheetForPayments } from "../utils";
import { getRptIdStringFromPayment } from "../utils/rptId";

export type UseMessageFooterActionsProps = {
  isCancelled: boolean;
  maxVisiblePaymentCount: number;
  messageId: string;
  payments: ReadonlyArray<NotificationPaymentInfo> | undefined;
  presentPaymentsBottomSheetRef: RefObject<(() => void) | undefined>;
  sendOpeningSource: SendOpeningSource;
  sendUserType: SendUserType;
};

/**
 * Builds the payment action displayed in a PN message footer while preserving
 * its navigation, analytics and loading behavior.
 */
export const useMessageFooterActions = ({
  messageId,
  payments,
  maxVisiblePaymentCount,
  isCancelled,
  presentPaymentsBottomSheetRef,
  sendOpeningSource,
  sendUserType
}: UseMessageFooterActionsProps): ComponentProps<
  typeof FooterActions
>["actions"] => {
  const dispatch = useDispatch();
  const toast = useIOToast();
  const buttonState = useIOSelector(state =>
    paymentsButtonStateSelector(
      state,
      messageId,
      payments,
      maxVisiblePaymentCount
    )
  );
  const canNavigateToPayment = useIOSelector(state =>
    canNavigateToPaymentFromMessageSelector(state)
  );
  const onFooterPressCallback = useCallback(() => {
    const shouldPresentPayments: boolean = shouldUseBottomSheetForPayments(
      false,
      payments
    );
    if (shouldPresentPayments) {
      trackPNShowAllPayments();
      presentPaymentsBottomSheetRef.current?.();
      return;
    }
    if (payments == null || payments.length === 0) {
      return;
    }
    const paymentId = getRptIdStringFromPayment(payments[0]);
    initializeAndNavigateToWalletForPayment(
      paymentId,
      true,
      canNavigateToPayment,
      dispatch,
      () => trackPNPaymentStart(sendOpeningSource, sendUserType),
      () => toast.error(I18n.t("genericError"))
    );
  }, [
    canNavigateToPayment,
    dispatch,
    payments,
    presentPaymentsBottomSheetRef,
    sendOpeningSource,
    sendUserType,
    toast
  ]);

  const isHidden = isCancelled || buttonState === "hidden";
  if (isHidden) {
    return undefined;
  }
  const isLoading = buttonState === "visibleLoading";

  return {
    type: "SingleButton",
    primary: {
      label: I18n.t("wallet.continue"),
      onPress: onFooterPressCallback,
      disabled: isLoading,
      loading: isLoading
    }
  };
};

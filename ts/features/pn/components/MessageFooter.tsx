import { MutableRefObject, useCallback } from "react";
import {
  FooterActions,
  FooterActionsMeasurements,
  useIOToast
} from "@pagopa/io-app-design-system";
import { useDispatch } from "react-redux";
import I18n from "i18next";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { useIOSelector } from "../../../store/hooks";
import { canNavigateToPaymentFromMessageSelector } from "../../messages/store/reducers/payments";
import { getRptIdStringFromPayment } from "../utils/rptId";
import { trackPNPaymentStart, trackPNShowAllPayments } from "../analytics";
import { initializeAndNavigateToWalletForPayment } from "../../messages/utils";
import { paymentsButtonStateSelector } from "../store/reducers/payments";
import { shouldUseBottomSheetForPayments } from "../utils";

export type MessageFooterProps = {
  messageId: string;
  payments: ReadonlyArray<NotificationPaymentInfo> | undefined;
  maxVisiblePaymentCount: number;
  isCancelled: boolean;
  presentPaymentsBottomSheetRef: MutableRefObject<(() => void) | undefined>;
  onMeasure: (measurements: FooterActionsMeasurements) => void;
};

export const MessageFooter = ({
  messageId,
  payments,
  maxVisiblePaymentCount,
  isCancelled,
  presentPaymentsBottomSheetRef,
  onMeasure
}: MessageFooterProps) => {
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
    if (shouldUseBottomSheetForPayments(false, payments)) {
      trackPNShowAllPayments();
      presentPaymentsBottomSheetRef.current?.();
    } else if (payments) {
      const firstPayment = payments[0];
      const paymentId = getRptIdStringFromPayment(firstPayment);
      initializeAndNavigateToWalletForPayment(
        paymentId,
        true,
        canNavigateToPayment,
        dispatch,
        () => trackPNPaymentStart(),
        () => toast.error(I18n.t("genericError"))
      );
    }
  }, [
    canNavigateToPayment,
    dispatch,
    payments,
    presentPaymentsBottomSheetRef,
    toast
  ]);
  if (isCancelled || buttonState === "hidden") {
    return null;
  }
  const isLoading = buttonState === "visibleLoading";

  return (
    <FooterActions
      onMeasure={onMeasure}
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("wallet.continue"),
          onPress: onFooterPressCallback,
          disabled: isLoading,
          loading: isLoading
        }
      }}
    />
  );
};

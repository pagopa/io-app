import {
  FooterActions,
  FooterActionsMeasurements,
  IOSpacing,
  useIOToast
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { MutableRefObject, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";

import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
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

export type MessageFooterProps = {
  isCancelled: boolean;
  maxVisiblePaymentCount: number;
  messageId: string;
  onMeasure: (measurements: FooterActionsMeasurements) => void;
  payments: ReadonlyArray<NotificationPaymentInfo> | undefined;
  presentPaymentsBottomSheetRef: MutableRefObject<(() => void) | undefined>;
  sendOpeningSource: SendOpeningSource;
  sendUserType: SendUserType;
};

export const MessageFooter = ({
  messageId,
  payments,
  maxVisiblePaymentCount,
  isCancelled,
  presentPaymentsBottomSheetRef,
  onMeasure,
  sendOpeningSource,
  sendUserType
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
        () => trackPNPaymentStart(sendOpeningSource, sendUserType),
        () => toast.error(I18n.t("genericError"))
      );
    }
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

  useEffect(() => {
    if (isHidden) {
      onMeasure({
        actionBlockHeight: 0,
        safeBottomAreaHeight: IOSpacing.screenEndMargin
      });
    }
  }, [isHidden, onMeasure]);

  if (isHidden) {
    return null;
  }
  const isLoading = buttonState === "visibleLoading";

  return (
    <FooterActions
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("wallet.continue"),
          onPress: onFooterPressCallback,
          disabled: isLoading,
          loading: isLoading
        }
      }}
      onMeasure={onMeasure}
    />
  );
};

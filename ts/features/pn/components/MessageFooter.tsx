import React, { MutableRefObject, useCallback } from "react";
import { View } from "react-native";
import {
  ButtonSolid,
  IOStyles,
  useIOToast
} from "@pagopa/io-app-design-system";
import { useDispatch } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import I18n from "../../../i18n";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { useIOSelector } from "../../../store/hooks";
import { UIMessageId } from "../../messages/types";
import { canNavigateToPaymentFromMessageSelector } from "../../messages/store/reducers/payments";
import { getRptIdStringFromPayment } from "../utils/rptId";
import { trackPNShowAllPayments } from "../analytics";
import { initializeAndNavigateToWalletForPayment } from "../../messages/utils";
import { paymentsButtonStateSelector } from "../store/reducers/payments";
import { shouldUseBottomSheetForPayments } from "../utils";
import { isNewPaymentSectionEnabledSelector } from "../../../store/reducers/backendStatus";

type MessageFooterProps = {
  messageId: UIMessageId;
  payments: ReadonlyArray<NotificationPaymentInfo> | undefined;
  maxVisiblePaymentCount: number;
  isCancelled: boolean;
  presentPaymentsBottomSheetRef: MutableRefObject<(() => void) | undefined>;
};

export const MessageFooter = ({
  messageId,
  payments,
  maxVisiblePaymentCount,
  isCancelled,
  presentPaymentsBottomSheetRef
}: MessageFooterProps) => {
  const safeAreaInsets = useSafeAreaInsets();
  const buttonState = useIOSelector(state =>
    paymentsButtonStateSelector(
      state,
      messageId,
      payments,
      maxVisiblePaymentCount
    )
  );
  const dispatch = useDispatch();
  const toast = useIOToast();
  const canNavigateToPayment = useIOSelector(state =>
    canNavigateToPaymentFromMessageSelector(state)
  );
  // Checks if the new wallet section is enabled
  const isNewWalletSectionEnabled = useIOSelector(
    isNewPaymentSectionEnabledSelector
  );
  const onFooterPressCallback = useCallback(() => {
    if (shouldUseBottomSheetForPayments(false, payments)) {
      trackPNShowAllPayments();
      presentPaymentsBottomSheetRef.current?.();
    } else if (payments) {
      const firstPayment = payments[0];
      const paymentId = getRptIdStringFromPayment(firstPayment);
      initializeAndNavigateToWalletForPayment(
        isNewWalletSectionEnabled,
        messageId,
        paymentId,
        false,
        undefined,
        canNavigateToPayment,
        dispatch,
        true,
        () => toast.error(I18n.t("genericError"))
      );
    }
  }, [
    canNavigateToPayment,
    dispatch,
    isNewWalletSectionEnabled,
    messageId,
    payments,
    presentPaymentsBottomSheetRef,
    toast
  ]);
  if (isCancelled || buttonState === "hidden") {
    return null;
  }
  const isLoading = buttonState === "visibleLoading";
  return (
    <View
      style={[
        IOStyles.footer,
        { paddingBottom: safeAreaInsets.bottom + IOStyles.footer.paddingBottom }
      ]}
    >
      <ButtonSolid
        disabled={isLoading}
        label={I18n.t("wallet.continue")}
        accessibilityLabel={I18n.t("wallet.continue")}
        onPress={onFooterPressCallback}
        fullWidth
        loading={isLoading}
      />
    </View>
  );
};

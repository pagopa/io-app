import React, { MutableRefObject, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import {
  ButtonSolid,
  IOStyles,
  useIOToast
} from "@pagopa/io-app-design-system";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import I18n from "../../../i18n";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import variables from "../../../theme/variables";
import { canNavigateToPaymentFromMessageSelector } from "../../messages/store/reducers/payments";
import { getRptIdStringFromPayment } from "../utils/rptId";
import { trackPNShowAllPayments } from "../analytics";
import { initializeAndNavigateToWalletForPayment } from "../../messages/utils";
import { UIMessageId } from "../../messages/types";
import { paymentsButtonStateSelector } from "../store/reducers/payments";

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    marginTop: -variables.footerShadowOffsetHeight,
    paddingTop: variables.footerShadowOffsetHeight
  }
});

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
  const buttonState = useIOSelector(state =>
    paymentsButtonStateSelector(
      state,
      messageId,
      payments,
      maxVisiblePaymentCount
    )
  );
  const dispatch = useIODispatch();
  const toast = useIOToast();
  const canNavigateToPayment = useIOSelector(state =>
    canNavigateToPaymentFromMessageSelector(state)
  );
  const onFooterPressCallback = useCallback(() => {
    if (payments?.length === 1) {
      const firstPayment = payments[0];
      const paymentId = getRptIdStringFromPayment(firstPayment);
      initializeAndNavigateToWalletForPayment(
        messageId,
        paymentId,
        false,
        undefined,
        canNavigateToPayment,
        dispatch,
        true,
        () => toast.error(I18n.t("genericError"))
      );
    } else {
      trackPNShowAllPayments();
      presentPaymentsBottomSheetRef.current?.();
    }
  }, [
    canNavigateToPayment,
    dispatch,
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
    <View style={styles.container}>
      <View style={IOStyles.footer}>
        <ButtonSolid
          disabled={isLoading}
          fullWidth={true}
          loading={isLoading}
          color="primary"
          label={I18n.t("wallet.continue")}
          onPress={onFooterPressCallback}
          accessibilityLabel={I18n.t("wallet.continue")}
        />
      </View>
    </View>
  );
};

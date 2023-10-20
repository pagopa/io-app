import React from "react";
import I18n from "i18n-js";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { useIOSelector } from "../../../store/hooks";
import { UIMessageId } from "../../../store/reducers/entities/messages/types";
import { paymentsButtonStateSelector } from "../store/reducers/payments";

type MessageFooterProps = {
  messageId: UIMessageId;
  payments: ReadonlyArray<NotificationPaymentInfo> | undefined;
  maxVisiblePaymentCount: number;
};

export const MessageFooter = ({
  messageId,
  payments,
  maxVisiblePaymentCount
}: MessageFooterProps) => {
  const buttonState = useIOSelector(state =>
    paymentsButtonStateSelector(
      state,
      messageId,
      payments,
      maxVisiblePaymentCount
    )
  );
  if (buttonState === "hidden") {
    return null;
  }
  // console.log(`=== MessageFooter: re-rendering`);
  const isLoading = buttonState === "visibleLoading";
  return (
    <FooterWithButtons
      type="SingleButton"
      leftButton={{
        block: true,
        onPress: () => undefined,
        title: I18n.t("wallet.continue"),
        isLoading
      }}
    />
  );
};

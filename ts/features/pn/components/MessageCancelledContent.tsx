import { Alert, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";

export type MessageCancelledContentProps = {
  isCancelled?: boolean;
  paidNoticeCodes?: ReadonlyArray<string>;
  payments?: ReadonlyArray<NotificationPaymentInfo>;
};

export const MessageCancelledContent = ({
  isCancelled,
  paidNoticeCodes,
  payments
}: MessageCancelledContentProps) => {
  if (!isCancelled) {
    return null;
  }
  const hasPayments =
    (payments?.length ?? 0) > 0 || (paidNoticeCodes?.length ?? 0) > 0;
  const paidNoticeCodeText = hasPayments
    ? ` ${I18n.t("features.pn.details.cancelledMessage.unpaidPaymentsNew")}`
    : "";
  const alertContent = `${I18n.t(
    "features.pn.details.cancelledMessage.body"
  )}${paidNoticeCodeText}`;
  return (
    <>
      <VSpacer />
      <Alert content={alertContent} variant="warning" />
    </>
  );
};

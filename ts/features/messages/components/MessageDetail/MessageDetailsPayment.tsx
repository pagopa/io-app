import { ListItemHeader, VSpacer } from "@pagopa/io-app-design-system";
import { UIMessageId } from "../../types";
import { useIOSelector } from "../../../../store/hooks";
import { messagePaymentDataSelector } from "../../store/reducers/detailsById";
import I18n from "../../../../i18n";
import { getRptIdStringFromPaymentData } from "../../utils";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { MessagePaymentItem } from "./MessagePaymentItem";

type MessageDetailsPaymentProps = {
  messageId: UIMessageId;
  serviceId: ServiceId;
};

export const MessageDetailsPayment = ({
  messageId,
  serviceId
}: MessageDetailsPaymentProps) => {
  const paymentData = useIOSelector(state =>
    messagePaymentDataSelector(state, messageId)
  );

  if (!paymentData) {
    return null;
  }

  const rptId = getRptIdStringFromPaymentData(paymentData);

  return (
    <>
      <VSpacer size={16} />
      <ListItemHeader
        label={I18n.t("features.messages.payments.title")}
        iconName={"productPagoPA"}
        iconColor={"blueItalia-500"}
      />
      <MessagePaymentItem
        hideExpirationDate
        messageId={messageId}
        noSpaceOnTop
        noticeNumber={paymentData.noticeNumber}
        rptId={rptId}
        serviceId={serviceId}
      />
    </>
  );
};

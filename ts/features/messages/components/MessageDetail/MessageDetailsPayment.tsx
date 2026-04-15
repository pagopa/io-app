import {
  ListItemHeader,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIOSelector } from "../../../../store/hooks";
import { messagePaymentDataSelector } from "../../store/reducers/detailsById";
import { getRptIdStringFromPaymentData } from "../../utils";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { MessagePaymentItem } from "./MessagePaymentItem";

type MessageDetailsPaymentProps = {
  messageId: string;
  serviceId: ServiceId;
};

export const MessageDetailsPayment = ({
  messageId,
  serviceId
}: MessageDetailsPaymentProps) => {
  const theme = useIOTheme();

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
        iconColor={theme["italyBrand-default"]}
      />
      <MessagePaymentItem
        hideExpirationDate
        messageId={messageId}
        noSpaceOnTop
        noticeNumber={paymentData.noticeNumber}
        rptId={rptId}
        serviceId={serviceId}
        sendOpeningSource={"not_set"}
        sendUserType={"not_set"}
      />
    </>
  );
};

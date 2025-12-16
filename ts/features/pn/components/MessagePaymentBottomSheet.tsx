import { MutableRefObject } from "react";
import { Dimensions } from "react-native";
import I18n from "i18next";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { useIODispatch } from "../../../store/hooks";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { MessagePaymentItem } from "../../messages/components/MessageDetail/MessagePaymentItem";
import { cancelQueuedPaymentUpdates } from "../../messages/store/actions";
import { getRptIdStringFromPayment } from "../utils/rptId";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import {
  SendOpeningSource,
  SendUserType
} from "../../pushNotifications/analytics";

export type MessagePaymentBottomSheetProps = {
  messageId: string;
  payments: ReadonlyArray<NotificationPaymentInfo>;
  presentPaymentsBottomSheetRef: MutableRefObject<(() => void) | undefined>;
  serviceId: ServiceId;
  sendOpeningSource: SendOpeningSource;
  sendUserType: SendUserType;
};

export const MessagePaymentBottomSheet = ({
  messageId,
  payments,
  presentPaymentsBottomSheetRef,
  serviceId,
  sendOpeningSource,
  sendUserType
}: MessagePaymentBottomSheetProps) => {
  const dispatch = useIODispatch();
  const windowHeight = Dimensions.get("window").height;
  const snapPoint = (payments.length > 5 ? 0.75 : 0.5) * windowHeight;
  // TODO replace with FlatList, check IOCOM-636 for further details
  const { present, dismiss, bottomSheet } = useIOBottomSheetModal({
    component: (
      <>
        {payments.map((payment, index) => {
          const rptId = getRptIdStringFromPayment(payment);
          return (
            <MessagePaymentItem
              index={index}
              isPNPayment
              key={`LI_${index}`}
              messageId={messageId}
              rptId={rptId}
              noticeNumber={payment.noticeCode}
              noSpaceOnTop={index === 0}
              serviceId={serviceId}
              willNavigateToPayment={() => dismiss()}
              sendOpeningSource={sendOpeningSource}
              sendUserType={sendUserType}
            />
          );
        })}
      </>
    ),
    title: I18n.t("features.pn.details.paymentSection.bottomSheetTitle"),
    snapPoint: [snapPoint],
    onDismiss: () => dispatch(cancelQueuedPaymentUpdates({ messageId }))
  });
  // eslint-disable-next-line functional/immutable-data
  presentPaymentsBottomSheetRef.current = present;
  return bottomSheet;
};

import I18n from "i18next";
import { MutableRefObject } from "react";
import { Dimensions } from "react-native";

import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { ServiceId } from "../../../../definitions/services/ServiceId";
import { useIODispatch } from "../../../store/hooks";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { MessagePaymentItem } from "../../messages/components/MessageDetail/MessagePaymentItem";
import { cancelQueuedPaymentUpdates } from "../../messages/store/actions";
import {
  SendOpeningSource,
  SendUserType
} from "../../pushNotifications/analytics";
import { getRptIdStringFromPayment } from "../utils/rptId";

export type MessagePaymentBottomSheetProps = {
  messageId: string;
  payments: ReadonlyArray<NotificationPaymentInfo>;
  presentPaymentsBottomSheetRef: MutableRefObject<(() => void) | undefined>;
  sendOpeningSource: SendOpeningSource;
  sendUserType: SendUserType;
  serviceId: ServiceId;
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
              noSpaceOnTop={index === 0}
              noticeNumber={payment.noticeCode}
              rptId={rptId}
              sendOpeningSource={sendOpeningSource}
              sendUserType={sendUserType}
              serviceId={serviceId}
              willNavigateToPayment={() => dismiss()}
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

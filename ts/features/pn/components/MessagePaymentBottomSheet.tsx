import I18n from "i18n-js";
import React, { MutableRefObject } from "react";
import { Dimensions, View } from "react-native";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { useIODispatch } from "../../../store/hooks";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { MessagePaymentItem } from "../../messages/components/MessageDetail/MessagePaymentItem";
import { cancelQueuedPaymentUpdates } from "../../messages/store/actions";
import { UIMessageId } from "../../messages/types";
import { getRptIdStringFromPayment } from "../utils/rptId";

export type MessagePaymentBottomSheetProps = {
  messageId: UIMessageId;
  payments: ReadonlyArray<NotificationPaymentInfo>;
  presentPaymentsBottomSheetRef: MutableRefObject<(() => void) | undefined>;
};

export const MessagePaymentBottomSheet = ({
  messageId,
  payments,
  presentPaymentsBottomSheetRef
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
              willNavigateToPayment={() => dismiss()}
            />
          );
        })}
      </>
    ),
    title: I18n.t("features.pn.details.paymentSection.bottomSheetTitle"),
    snapPoint: [snapPoint],
    footer: <View></View>,
    onDismiss: () => dispatch(cancelQueuedPaymentUpdates())
  });
  // eslint-disable-next-line functional/immutable-data
  presentPaymentsBottomSheetRef.current = present;
  return bottomSheet;
};

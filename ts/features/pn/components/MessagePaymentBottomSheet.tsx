import React, { MutableRefObject } from "react";
import { Dimensions, View } from "react-native";
import I18n from "i18n-js";
import { useDispatch } from "react-redux";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { UIMessageId } from "../../messages/types";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { cancelQueuedPaymentUpdates } from "../../messages/store/actions";
import { MessagePaymentItem } from "./MessagePaymentItem";

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
  const dispatch = useDispatch();
  const windowHeight = Dimensions.get("window").height;
  const snapPoint = (payments.length > 5 ? 0.75 : 0.5) * windowHeight;
  // TODO replace with FlatList, check IOCOM-636 for further details
  const { present, dismiss, bottomSheet } = useIOBottomSheetModal({
    component: (
      <>
        {payments.map((payment, index) => (
          <MessagePaymentItem
            index={index}
            key={`LI_${index}`}
            messageId={messageId}
            payment={payment}
            noSpaceOnTop={index === 0}
            willNavigateToPayment={() => dismiss()}
          />
        ))}
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

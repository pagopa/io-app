import React, { MutableRefObject } from "react";
import { Dimensions, FlatList, View } from "react-native";
import I18n from "i18n-js";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { UIMessageId } from "../../../store/reducers/entities/messages/types";
import { getRptIdStringFromPayment } from "../utils/rptId";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { MessagePaymentItem } from "./MessagePaymentItem";

export type MessagePaymentBottomSheetProps = {
  messageId: UIMessageId;
  payments: ReadonlyArray<NotificationPaymentInfo>;
  presentPaymentsBottomSheetRef: MutableRefObject<(() => void) | undefined>;
  dismissPaymentsBottomSheetRef: MutableRefObject<(() => void) | undefined>;
};

export const MessagePaymentBottomSheet = ({
  messageId,
  payments,
  presentPaymentsBottomSheetRef,
  dismissPaymentsBottomSheetRef
}: MessagePaymentBottomSheetProps) => {
  const windowHeight = Dimensions.get("window").height;
  const snapPoint = (payments.length > 5 ? 0.75 : 0.5) * windowHeight;
  const { present, dismiss, bottomSheet } = useIOBottomSheetModal({
    component: (
      <FlatList
        data={payments}
        renderItem={({ item, index }) => (
          <MessagePaymentItem
            index={index}
            payment={item}
            messageId={messageId}
            noSpaceOnTop={index === 0}
            willNavigateToPayment={() => dismiss()}
          />
        )}
        keyExtractor={(item, _) => `LI_${getRptIdStringFromPayment(item)}`}
      />
    ),
    title: I18n.t("features.pn.details.paymentSection.bottomSheetTitle"),
    snapPoint: [snapPoint],
    footer: <View></View>
  });
  // eslint-disable-next-line functional/immutable-data
  presentPaymentsBottomSheetRef.current = present;
  // eslint-disable-next-line functional/immutable-data
  dismissPaymentsBottomSheetRef.current = dismiss;
  // console.log(`=== Bottom Sheet: re-rendering`);
  return bottomSheet;
};

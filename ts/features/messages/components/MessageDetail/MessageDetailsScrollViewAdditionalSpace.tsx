import * as React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IOStyles, buttonSolidHeight } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { UIMessageId } from "../../types";
import { useIOSelector } from "../../../../store/hooks";
import { isPaymentsButtonVisibleSelector } from "../../store/reducers/payments";
import { gapBetweenItemsInAGrid } from "../../utils";

type ScrollViewAdditionalSpaceProps = {
  messageId: UIMessageId;
  hasCTAS: boolean;
};

export const MessageDetailsScrollViewAdditionalSpace = ({
  messageId,
  hasCTAS
}: ScrollViewAdditionalSpaceProps) => {
  const safeAreaInsets = useSafeAreaInsets();
  const isShowingPaymentButton = useIOSelector(state =>
    isPaymentsButtonVisibleSelector(state, messageId)
  );
  const stickyFooterRowHeight =
    IOStyles.footer.paddingBottom + buttonSolidHeight + gapBetweenItemsInAGrid;

  const height =
    safeAreaInsets.bottom +
    IOStyles.footer.paddingBottom +
    (isShowingPaymentButton ? stickyFooterRowHeight : 0) +
    (hasCTAS ? stickyFooterRowHeight : 0);
  return (
    <View
      style={{
        height
      }}
    ></View>
  );
};

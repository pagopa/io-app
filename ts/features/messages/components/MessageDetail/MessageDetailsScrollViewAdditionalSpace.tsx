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
  hasCTA1: boolean;
  hasCTA2: boolean;
};

export const MessageDetailsScrollViewAdditionalSpace = ({
  messageId,
  hasCTA1,
  hasCTA2
}: ScrollViewAdditionalSpaceProps) => {
  const safeAreaInsets = useSafeAreaInsets();
  const isShowingPaymentButton = useIOSelector(state =>
    isPaymentsButtonVisibleSelector(state, messageId)
  );
  const hasAtLeastAButton = isShowingPaymentButton || hasCTA1 || hasCTA2;

  const height =
    (hasAtLeastAButton ? IOStyles.footer.paddingBottom : 0) +
    (isShowingPaymentButton ? buttonSolidHeight + gapBetweenItemsInAGrid : 0) +
    (hasCTA1 ? buttonSolidHeight + gapBetweenItemsInAGrid : 0) +
    (hasCTA2 ? buttonSolidHeight + gapBetweenItemsInAGrid : 0) +
    gapBetweenItemsInAGrid +
    IOStyles.footer.paddingBottom +
    safeAreaInsets.bottom;
  return (
    <View
      style={{
        height
      }}
    ></View>
  );
};

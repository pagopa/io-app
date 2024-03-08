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
};

export const ScrollViewAdditionalSpace = ({
  messageId
}: ScrollViewAdditionalSpaceProps) => {
  const safeAreaInsets = useSafeAreaInsets();
  const isShowingPaymentButton = useIOSelector(state =>
    isPaymentsButtonVisibleSelector(state, messageId)
  );

  const height =
    safeAreaInsets.bottom +
    IOStyles.footer.paddingBottom +
    (isShowingPaymentButton
      ? IOStyles.footer.paddingBottom +
        buttonSolidHeight +
        gapBetweenItemsInAGrid
      : 0);
  return (
    <View
      style={{
        height
      }}
    ></View>
  );
};

import { buttonSolidHeight, IOStyles } from "@io-app/design-system";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useIOSelector } from "../../../../store/hooks";
import { isPaymentsButtonVisibleSelector } from "../../store/reducers/payments";
import { gapBetweenItemsInAGrid } from "../../utils";

type ScrollViewAdditionalSpaceProps = {
  hasCTA1: boolean;
  hasCTA2: boolean;
  messageId: string;
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

  /* TODO: Replace this logic with `FooterActions` and `useFooterActionsMeasurements` OR
  `IOScrollView` that already manages the case with three buttons */
  const height =
    (hasAtLeastAButton ? IOStyles.footer.paddingBottom : 0) +
    (isShowingPaymentButton ? buttonSolidHeight + gapBetweenItemsInAGrid : 0) +
    (hasCTA1 ? buttonSolidHeight + gapBetweenItemsInAGrid : 0) +
    (hasCTA2 ? buttonSolidHeight + gapBetweenItemsInAGrid : 0) +
    gapBetweenItemsInAGrid +
    safeAreaInsets.bottom;

  return (
    <View
      style={{
        height
      }}
    />
  );
};

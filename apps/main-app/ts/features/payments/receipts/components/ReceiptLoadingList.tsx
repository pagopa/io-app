import {
  IOSkeleton,
  ListItemTransaction,
  VSpacer
} from "@io-app/design-system";
import { View } from "react-native";

import { ReceiptFadeInOutAnimationView } from "./ReceiptFadeInOutAnimationView";

type ReceiptLoadingListProps = {
  showSectionTitleSkeleton?: boolean;
};

export const ReceiptLoadingList = ({
  showSectionTitleSkeleton
}: ReceiptLoadingListProps) => (
  <>
    {showSectionTitleSkeleton && (
      <View testID="section-title-skeleton">
        <VSpacer size={16} />
        <IOSkeleton height={16} radius={8} shape="rectangle" width={62} />
        <VSpacer size={16} />
      </View>
    )}

    {Array.from({ length: 5 }).map((_, index) => (
      <ReceiptFadeInOutAnimationView key={index}>
        <ListItemTransaction
          isLoading={true}
          subtitle=""
          title=""
          transaction={{
            amount: "",
            amountAccessibilityLabel: ""
          }}
        />
      </ReceiptFadeInOutAnimationView>
    ))}
  </>
);

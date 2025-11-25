import {
  IOSkeleton,
  ListItemTransaction,
  VSpacer
} from "@pagopa/io-app-design-system";
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
        <IOSkeleton shape="rectangle" radius={8} width={62} height={16} />
        <VSpacer size={16} />
      </View>
    )}

    {Array.from({ length: 5 }).map((_, index) => (
      <ReceiptFadeInOutAnimationView key={index}>
        <ListItemTransaction
          isLoading={true}
          transaction={{
            amount: "",
            amountAccessibilityLabel: ""
          }}
          title=""
          subtitle=""
        />
      </ReceiptFadeInOutAnimationView>
    ))}
  </>
);

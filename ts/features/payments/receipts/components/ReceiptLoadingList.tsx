import { ListItemTransaction, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import Placeholder from "rn-placeholder";
import { ReceiptFadeInOutAnimationView } from "./ReceiptFadeInOutAnimationView";

export type ReceiptLoadingListProps = {
  showSectionTitleSkeleton?: boolean;
};

export const ReceiptLoadingList = ({
  showSectionTitleSkeleton
}: ReceiptLoadingListProps) => (
  <>
    {showSectionTitleSkeleton && (
      <View testID="section-title-skeleton">
        <VSpacer size={16} />
        <Placeholder.Box animate="fade" radius={8} width={62} height={16} />
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

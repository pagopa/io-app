import { ListItemTransaction, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import Placeholder from "rn-placeholder";
import { PaymentsBizEventsFadeInOutAnimationView } from "./PaymentsBizEventsFadeInOutAnimationView";

export type PaymentsBizEventsTransactionLoadingListProps = {
  showSectionTitleSkeleton?: boolean;
};

export const PaymentsBizEventsTransactionLoadingList = ({
  showSectionTitleSkeleton
}: PaymentsBizEventsTransactionLoadingListProps) => (
  <>
    {showSectionTitleSkeleton && (
      <View testID="section-title-skeleton">
        <VSpacer size={16} />
        <Placeholder.Box animate="fade" radius={8} width={62} height={16} />
        <VSpacer size={16} />
      </View>
    )}

    {Array.from({ length: 5 }).map((_, index) => (
      <PaymentsBizEventsFadeInOutAnimationView key={index}>
        <ListItemTransaction
          isLoading={true}
          transaction={{
            amount: "",
            amountAccessibilityLabel: ""
          }}
          title=""
          subtitle=""
        />
      </PaymentsBizEventsFadeInOutAnimationView>
    ))}
  </>
);

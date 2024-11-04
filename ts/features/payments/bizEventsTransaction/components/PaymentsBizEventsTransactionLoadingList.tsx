import { ListItemTransaction, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
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
      <>
        <VSpacer size={16} />
        <Placeholder.Box animate="fade" radius={8} width={62} height={16} />
        <VSpacer size={16} />
      </>
    )}

    {Array.from({ length: 5 }).map((_, index) => (
      <PaymentsBizEventsFadeInOutAnimationView key={index}>
        <ListItemTransaction
          isLoading={true}
          transactionStatus="success"
          transactionAmount=""
          title=""
          subtitle=""
        />
      </PaymentsBizEventsFadeInOutAnimationView>
    ))}
  </>
);

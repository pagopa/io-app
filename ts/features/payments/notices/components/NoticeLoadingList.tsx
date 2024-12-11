import { ListItemTransaction, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import Placeholder from "rn-placeholder";
import { NoticeFadeInOutAnimationView } from "./NoticeFadeInOutAnimationView";

export type NoticeLoadingListProps = {
  showSectionTitleSkeleton?: boolean;
};

export const NoticeLoadingList = ({
  showSectionTitleSkeleton
}: NoticeLoadingListProps) => (
  <>
    {showSectionTitleSkeleton && (
      <View testID="section-title-skeleton">
        <VSpacer size={16} />
        <Placeholder.Box animate="fade" radius={8} width={62} height={16} />
        <VSpacer size={16} />
      </View>
    )}

    {Array.from({ length: 5 }).map((_, index) => (
      <NoticeFadeInOutAnimationView key={index}>
        <ListItemTransaction
          isLoading={true}
          transaction={{
            amount: "",
            amountAccessibilityLabel: ""
          }}
          title=""
          subtitle=""
        />
      </NoticeFadeInOutAnimationView>
    ))}
  </>
);

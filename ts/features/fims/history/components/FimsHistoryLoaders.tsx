import { Divider } from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import Placeholder from "rn-placeholder";

export const LoadingFimsHistoryItemsFooter = ({
  showFirstDivider
}: {
  showFirstDivider?: boolean;
}) => (
  <>
    {showFirstDivider && <Divider />}
    <LoadingFimsHistoryListItem />
    <Divider />
    <LoadingFimsHistoryListItem />
    <Divider />
    <LoadingFimsHistoryListItem />
  </>
);

export const LoadingFimsHistoryListItem = () => (
  <View style={{ paddingVertical: 16 }}>
    <Placeholder.Box height={16} width={178} radius={8} animate="fade" />
  </View>
);

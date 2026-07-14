import { Divider, IOSkeleton, VSpacer } from "@io-app/design-system";
import { View } from "react-native";

import { FimsHistorySharedStyles } from "../utils/styles";

export const LoadingFimsHistoryItemsFooter = ({
  showFirstDivider
}: {
  showFirstDivider?: boolean;
}) => (
  <>
    {showFirstDivider && <Divider />}
    <LoadingFimsHistoryListItem />
    <LoadingFimsHistoryListItem />
    <LoadingFimsHistoryListItem />
  </>
);

export const LoadingFimsHistoryListItem = () => (
  <View style={FimsHistorySharedStyles.fixedHeightListItem}>
    <IOSkeleton height={8} radius={8} shape="rectangle" width={"25%"} />
    <VSpacer size={16} />
    <IOSkeleton height={16} radius={8} shape="rectangle" width={"70%"} />
    <VSpacer size={8} />
    <IOSkeleton height={16} radius={8} shape="rectangle" width={"50%"} />
  </View>
);

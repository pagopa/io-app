import { Divider, IOSkeleton, VSpacer } from "@pagopa/io-app-design-system";
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
    <IOSkeleton shape="rectangle" width={"25%"} height={8} radius={8} />
    <VSpacer size={16} />
    <IOSkeleton shape="rectangle" width={"70%"} height={16} radius={8} />
    <VSpacer size={8} />
    <IOSkeleton shape="rectangle" width={"50%"} height={16} radius={8} />
  </View>
);

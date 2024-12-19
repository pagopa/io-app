import { Divider, VSpacer } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import Placeholder from "rn-placeholder";
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
    <Placeholder.Box height={8} width={84} radius={8} animate="fade" />
    <VSpacer size={16} />
    <Placeholder.Box height={16} width={248} radius={8} animate="fade" />
    <VSpacer size={8} />
    <Placeholder.Box height={16} width={178} radius={8} animate="fade" />
  </View>
);

import * as React from "react";
import { View, FlatList, ListRenderItemInfo, Platform } from "react-native";
import Animated from "react-native-reanimated";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import ItemSeparatorComponent from "../../../../../components/ItemSeparatorComponent";
import { EdgeBorderComponent } from "../../../../../components/screens/EdgeBorderComponent";
import { OfflineMerchant } from "../../../../../../definitions/cgn/merchants/OfflineMerchant";
import { OnlineMerchant } from "../../../../../../definitions/cgn/merchants/OnlineMerchant";
import { Merchant } from "../../../../../../definitions/cgn/merchants/Merchant";
import CgnMerchantListItem from "./CgnMerchantListItem";

type Props = {
  merchantList: ReadonlyArray<OfflineMerchant | OnlineMerchant>;
  onItemPress: (id: Merchant["id"]) => void;
  onRefresh: () => void;
  onScroll?: React.ComponentProps<typeof Animated.FlatList>["onScroll"];
  titleHeight?: number;
  refreshing: boolean;
};

// Component that renders the list of merchants as a FlatList
const CgnMerchantsListView: React.FunctionComponent<Props> = (props: Props) => {
  const renderListItem = (
    listItem: ListRenderItemInfo<OfflineMerchant | OnlineMerchant>
  ) => (
    <CgnMerchantListItem
      categories={listItem.item.productCategories}
      name={listItem.item.name}
      onPress={() => props.onItemPress(listItem.item.id)}
      isNew={listItem.item.newDiscounts}
    />
  );

  return (
    <View style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
      <Animated.FlatList
        showsVerticalScrollIndicator={Platform.OS !== "ios"}
        scrollEnabled={true}
        data={props.merchantList}
        onScroll={props.onScroll}
        snapToOffsets={props.titleHeight ? [0, props.titleHeight] : undefined}
        scrollEventThrottle={8}
        snapToEnd={false}
        decelerationRate="normal"
        ItemSeparatorComponent={() => (
          <ItemSeparatorComponent noPadded={true} />
        )}
        refreshing={props.refreshing}
        onRefresh={props.onRefresh}
        renderItem={renderListItem}
        keyExtractor={c => c.id}
        keyboardShouldPersistTaps={"handled"}
        ListFooterComponent={
          props.merchantList.length > 0 ? <EdgeBorderComponent /> : null
        }
      />
    </View>
  );
};

export default CgnMerchantsListView;

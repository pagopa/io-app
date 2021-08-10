import * as React from "react";
import { View } from "native-base";
import { FlatList, ListRenderItemInfo } from "react-native";
import { index } from "fp-ts/lib/Array";
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
};

// Component that renders the list of merchants as a FlatList
const CgnMerchantsListView: React.FunctionComponent<Props> = (props: Props) => {
  const renderListItem = (
    listItem: ListRenderItemInfo<OfflineMerchant | OnlineMerchant>
  ) => {
    const location = OfflineMerchant.is(listItem.item)
      ? listItem.item.address.full_address
      : listItem.item.websiteUrl;
    return (
      <CgnMerchantListItem
        category={index(0, [...listItem.item.productCategories]).toUndefined()}
        name={listItem.item.name}
        location={location}
        onPress={() => props.onItemPress(listItem.item.id)}
      />
    );
  };

  return (
    <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
      <FlatList
        scrollEnabled={true}
        data={props.merchantList}
        ItemSeparatorComponent={() => (
          <ItemSeparatorComponent noPadded={true} />
        )}
        renderItem={renderListItem}
        keyExtractor={c => c.id}
        keyboardShouldPersistTaps={"handled"}
        ListFooterComponent={
          props.merchantList.length > 0 && <EdgeBorderComponent />
        }
      />
    </View>
  );
};

export default CgnMerchantsListView;

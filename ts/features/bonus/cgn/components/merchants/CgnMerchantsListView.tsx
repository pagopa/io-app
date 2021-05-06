import * as React from "react";
import { View } from "native-base";
import { FlatList, ListRenderItemInfo } from "react-native";
import { TmpMerchantType } from "../../screens/merchants/CgnMerchantsListScreen";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import ItemSeparatorComponent from "../../../../../components/ItemSeparatorComponent";
import { EdgeBorderComponent } from "../../../../../components/screens/EdgeBorderComponent";
import CgnMerchantListItem from "./CgnMerchantListItem";

type Props = {
  merchantList: ReadonlyArray<TmpMerchantType>;
  onItemPress: () => void;
};

const CgnMerchantsListView: React.FunctionComponent<Props> = (props: Props) => {
  const renderListItem = (listItem: ListRenderItemInfo<TmpMerchantType>) => (
    <CgnMerchantListItem
      category={listItem.item.category}
      name={listItem.item.name}
      location={listItem.item.location}
      onPress={props.onItemPress}
    />
  );

  return (
    <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
      <FlatList
        scrollEnabled={true}
        data={props.merchantList}
        ItemSeparatorComponent={() => (
          <ItemSeparatorComponent noPadded={true} />
        )}
        renderItem={renderListItem}
        keyExtractor={c => `${c.name}-${c.category}`}
        keyboardShouldPersistTaps={"handled"}
        ListFooterComponent={
          props.merchantList.length > 0 && <EdgeBorderComponent />
        }
      />
    </View>
  );
};

export default CgnMerchantsListView;

import * as React from "react";
import { View, FlatList, ListRenderItemInfo, Platform } from "react-native";
import { Badge, H6, ListItemNav } from "@pagopa/io-app-design-system";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import ItemSeparatorComponent from "../../../../../components/ItemSeparatorComponent";
import { EdgeBorderComponent } from "../../../../../components/screens/EdgeBorderComponent";
import { OfflineMerchant } from "../../../../../../definitions/cgn/merchants/OfflineMerchant";
import { OnlineMerchant } from "../../../../../../definitions/cgn/merchants/OnlineMerchant";
import { Merchant } from "../../../../../../definitions/cgn/merchants/Merchant";
import I18n from "../../../../../i18n";

type Props = {
  merchantList: ReadonlyArray<OfflineMerchant | OnlineMerchant>;
  onItemPress: (id: Merchant["id"]) => void;
  onRefresh: () => void;
  refreshing: boolean;
};

// Component that renders the list of merchants as a FlatList
const CgnMerchantsListView: React.FunctionComponent<Props> = (props: Props) => {
  const renderListItem = (
    listItem: ListRenderItemInfo<OfflineMerchant | OnlineMerchant>
  ) => (
    <>
      <ListItemNav
        onPress={() => props.onItemPress(listItem.item.id)}
        value={
          listItem.item.newDiscounts ? (
            <View style={IOStyles.rowSpaceBetween}>
              <H6 style={{ flexGrow: 1, flexShrink: 1 }}>
                {listItem.item.name}
              </H6>
              <View style={{ alignSelf: "center" }}>
                <Badge
                  variant="purple"
                  text={I18n.t("bonus.cgn.merchantsList.news")}
                />
              </View>
            </View>
          ) : (
            listItem.item.name
          )
        }
        accessibilityLabel={listItem.item.name}
      />
    </>
  );

  return (
    <View style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
      <FlatList
        showsVerticalScrollIndicator={Platform.OS !== "ios"}
        scrollEnabled={true}
        data={props.merchantList}
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

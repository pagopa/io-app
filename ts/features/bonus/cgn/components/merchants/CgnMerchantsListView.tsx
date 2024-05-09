import * as React from "react";
import { FlatList, View } from "react-native";
import { Badge, Divider, H6, ListItemNav } from "@pagopa/io-app-design-system";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { OfflineMerchant } from "../../../../../../definitions/cgn/merchants/OfflineMerchant";
import { OnlineMerchant } from "../../../../../../definitions/cgn/merchants/OnlineMerchant";
import { Merchant } from "../../../../../../definitions/cgn/merchants/Merchant";
import I18n from "../../../../../i18n";

type Props = {
  merchantList: ReadonlyArray<OfflineMerchant | OnlineMerchant>;
  onItemPress: (id: Merchant["id"]) => void;
};

// Component that renders the list of merchants as a FlatList
const CgnMerchantsListView: React.FunctionComponent<Props> = (props: Props) => (
  <FlatList
    style={IOStyles.horizontalContentPadding}
    ItemSeparatorComponent={() => <Divider />}
    scrollEnabled={false}
    data={props.merchantList}
    keyExtractor={item => item.id}
    renderItem={({ item }) => (
      <ListItemNav
        onPress={() => props.onItemPress(item.id)}
        value={
          <View style={IOStyles.rowSpaceBetween}>
            <H6 style={{ flexGrow: 1, flexShrink: 1 }}>{item.name}</H6>
            {item.newDiscounts && (
              <View style={[IOStyles.rowSpaceBetween, IOStyles.alignCenter]}>
                <Badge
                  variant="purple"
                  text={I18n.t("bonus.cgn.merchantsList.news")}
                />
              </View>
            )}
          </View>
        }
        accessibilityLabel={item.name}
      />
    )}
  />
);

export default CgnMerchantsListView;

import * as React from "react";
import { View } from "react-native";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { OfflineMerchant } from "../../../../../../definitions/cgn/merchants/OfflineMerchant";
import { OnlineMerchant } from "../../../../../../definitions/cgn/merchants/OnlineMerchant";
import { Merchant } from "../../../../../../definitions/cgn/merchants/Merchant";
import CgnMerchantListItem from "./CgnMerchantListItem";

type Props = {
  merchantList: ReadonlyArray<OfflineMerchant | OnlineMerchant>;
  onItemPress: (id: Merchant["id"]) => void;
};

// Component that renders the list of merchants as a FlatList
const CgnMerchantsListView: React.FunctionComponent<Props> = (props: Props) => (
  <View style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
    {props.merchantList.map((merchant, index) => (
      <CgnMerchantListItem
        key={index}
        categories={merchant.productCategories}
        name={merchant.name}
        onPress={() => props.onItemPress(merchant.id)}
        isNew={merchant.newDiscounts}
      />
    ))}
  </View>
);

export default CgnMerchantsListView;

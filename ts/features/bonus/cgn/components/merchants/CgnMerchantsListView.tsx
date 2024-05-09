import * as React from "react";
import { View } from "react-native";
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
  <View style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
    {props.merchantList.map((merchant, index) => (
      <React.Fragment key={index}>
        <ListItemNav
          onPress={() => props.onItemPress(merchant.id)}
          value={
            <View style={IOStyles.rowSpaceBetween}>
              <H6 style={{ flexGrow: 1, flexShrink: 1 }}>{merchant.name}</H6>
              {merchant.newDiscounts && (
                <View style={[IOStyles.rowSpaceBetween, IOStyles.alignCenter]}>
                  <Badge
                    variant="purple"
                    text={I18n.t("bonus.cgn.merchantsList.news")}
                  />
                </View>
              )}
            </View>
          }
          accessibilityLabel={merchant.name}
        />
        {props.merchantList.length - 1 !== index && <Divider />}
      </React.Fragment>
    ))}
  </View>
);

export default CgnMerchantsListView;

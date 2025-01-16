import * as React from "react";
import { ListRenderItem, View } from "react-native";
import { Badge, H6, ListItemNav } from "@pagopa/io-app-design-system";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { OfflineMerchant } from "../../../../../../definitions/cgn/merchants/OfflineMerchant";
import { OnlineMerchant } from "../../../../../../definitions/cgn/merchants/OnlineMerchant";
import { Merchant } from "../../../../../../definitions/cgn/merchants/Merchant";

export const CgnMerchantListViewRenderItem =
  (props: {
    onItemPress: (id: Merchant["id"]) => void;
  }): ListRenderItem<OfflineMerchant | OnlineMerchant> =>
  ({ item }) =>
    (
      <View style={IOStyles.horizontalContentPadding}>
        <ListItemNav
          onPress={() => props.onItemPress(item.id)}
          value={
            <View style={IOStyles.rowSpaceBetween}>
              <H6 style={{ flexGrow: 1, flexShrink: 1 }}>{item.name}</H6>
              {item.newDiscounts && (
                <View style={[IOStyles.rowSpaceBetween, IOStyles.alignCenter]}>
                  <Badge
                    variant="purple"
                    text={String(item.numberOfNewDiscounts)}
                  />
                </View>
              )}
            </View>
          }
          accessibilityLabel={item.name}
        />
      </View>
    );

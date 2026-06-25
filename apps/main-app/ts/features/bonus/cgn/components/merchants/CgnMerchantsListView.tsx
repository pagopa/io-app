import {
  Badge,
  ContentWrapper,
  H6,
  HSpacer,
  ListItemNav
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { ListRenderItem, View } from "react-native";

import { Merchant } from "../../../../../../definitions/cgn/merchants/Merchant";
import { OfflineMerchant } from "../../../../../../definitions/cgn/merchants/OfflineMerchant";
import { OnlineMerchant } from "../../../../../../definitions/cgn/merchants/OnlineMerchant";
import { getListItemAccessibilityLabelCount } from "../../../../../utils/accessibility";

type Props = {
  count: number;
  onItemPress: (id: Merchant["id"]) => void;
};

export const CgnMerchantListViewRenderItem =
  (props: Props): ListRenderItem<OfflineMerchant | OnlineMerchant> =>
  ({ item, index }) => {
    const accessibilityLabel =
      (item.newDiscounts
        ? `${item.name} ${I18n.t("bonus.cgn.merchantsList.news")}`
        : item.name) + getListItemAccessibilityLabelCount(props.count, index);

    return (
      <ContentWrapper>
        <ListItemNav
          accessibilityLabel={accessibilityLabel}
          onPress={() => props.onItemPress(item.id)}
          value={
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <H6 style={{ flexGrow: 1, flexShrink: 1 }}>{item.name}</H6>
              <HSpacer />
              {item.newDiscounts && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <Badge
                    accessible={false}
                    text={I18n.t("bonus.cgn.merchantsList.news")}
                    variant="cgn"
                  />
                </View>
              )}
            </View>
          }
        />
      </ContentWrapper>
    );
  };

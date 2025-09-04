import {
  Badge,
  ContentWrapper,
  H6,
  HSpacer,
  ListItemNav
} from "@pagopa/io-app-design-system";
import { ListRenderItem, View } from "react-native";
import I18n from "i18next";
import { Merchant } from "../../../../../../definitions/cgn/merchants/Merchant";
import { OfflineMerchant } from "../../../../../../definitions/cgn/merchants/OfflineMerchant";
import { OnlineMerchant } from "../../../../../../definitions/cgn/merchants/OnlineMerchant";
import { getListItemAccessibilityLabelCount } from "../../../../../utils/accessibility";

type Props = {
  onItemPress: (id: Merchant["id"]) => void;
  count: number;
};

export const CgnMerchantListViewRenderItem =
  (props: Props): ListRenderItem<OfflineMerchant | OnlineMerchant> =>
  ({ item, index }) => {
    const accessibilityLabel =
      (item?.numberOfNewDiscounts
        ? I18n.t("bonus.cgn.merchantsList.categoriesList.a11y", {
            name: item.name,
            count: item.numberOfNewDiscounts
          })
        : item.newDiscounts
        ? `${item.name} ${I18n.t("bonus.cgn.merchantsList.news")}`
        : item.name) + getListItemAccessibilityLabelCount(props.count, index);

    return (
      <ContentWrapper>
        <ListItemNav
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
                    variant="cgn"
                    text={
                      item.numberOfNewDiscounts
                        ? item.numberOfNewDiscounts.toString()
                        : I18n.t("bonus.cgn.merchantsList.news")
                    }
                  />
                </View>
              )}
            </View>
          }
          accessibilityLabel={accessibilityLabel}
        />
      </ContentWrapper>
    );
  };

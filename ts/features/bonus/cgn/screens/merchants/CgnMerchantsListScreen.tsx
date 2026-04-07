import { Badge, H6, HSpacer, ListItemNav } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useMemo } from "react";
import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { Merchant } from "../../../../../../definitions/cgn/merchants/Merchant";
import { OfflineMerchant } from "../../../../../../definitions/cgn/merchants/OfflineMerchant";
import { OnlineMerchant } from "../../../../../../definitions/cgn/merchants/OnlineMerchant";
import {
  getValueOrElse,
  isLoading
} from "../../../../../common/model/RemoteValue";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { getListItemAccessibilityLabelCount } from "../../../../../utils/accessibility";
import { CgnMerchantListSkeleton } from "../../components/merchants/CgnMerchantListSkeleton";
import CGN_ROUTES from "../../navigation/routes";
import {
  cgnOfflineMerchants,
  cgnOnlineMerchants
} from "../../store/actions/merchants";
import {
  cgnOfflineMerchantsSelector,
  cgnOnlineMerchantsSelector
} from "../../store/reducers/merchants";
import { mixAndSortMerchants } from "../../utils/merchants";

export type MerchantsAll = OfflineMerchant | OnlineMerchant;

export const CgnMerchantsListScreen = () => {
  const navigator = useIONavigation();
  const dispatch = useDispatch();

  const onlineMerchants = useSelector(cgnOnlineMerchantsSelector);
  const offlineMerchants = useSelector(cgnOfflineMerchantsSelector);

  const data = useMemo(
    () =>
      mixAndSortMerchants(
        getValueOrElse(onlineMerchants, []),
        getValueOrElse(offlineMerchants, [])
      ),
    [onlineMerchants, offlineMerchants]
  );

  const initLoadingLists = useCallback(() => {
    dispatch(cgnOfflineMerchants.request({}));
    dispatch(cgnOnlineMerchants.request({}));
  }, [dispatch]);

  useFocusEffect(initLoadingLists);

  const onItemPress = useCallback(
    (merchantID: Merchant["id"]) => {
      navigator.navigate(CGN_ROUTES.DETAILS.MAIN, {
        screen: CGN_ROUTES.DETAILS.MERCHANTS.DETAIL,
        params: { merchantID }
      });
    },
    [navigator]
  );

  const renderItem = (item: MerchantsAll, index: number) => {
    const accessibilityLabel =
      (item?.numberOfNewDiscounts
        ? I18n.t("bonus.cgn.merchantsList.categoriesList.a11y", {
            name: item.name,
            count: item.numberOfNewDiscounts
          })
        : item.newDiscounts
          ? `${item.name} ${I18n.t("bonus.cgn.merchantsList.news")}`
          : item.name) + getListItemAccessibilityLabelCount(data.length, index);
    return (
      <ListItemNav
        accessibilityLabel={accessibilityLabel}
        key={item.id}
        onPress={() => onItemPress(item.id)}
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
                  text={
                    item?.numberOfNewDiscounts
                      ? item.numberOfNewDiscounts.toString()
                      : I18n.t("bonus.cgn.merchantsList.news")
                  }
                  variant="cgn"
                />
              </View>
            )}
          </View>
        }
      />
    );
  };

  const refreshControlProps = {
    refreshing: isLoading(onlineMerchants) || isLoading(offlineMerchants),
    onRefresh: initLoadingLists
  };

  const ListEmptyComponent = (
    <OperationResultScreenContent
      action={{
        label: I18n.t("global.buttons.retry"),
        onPress: initLoadingLists
      }}
      pictogram="umbrella"
      title={I18n.t("wallet.payment.outcome.GENERIC_ERROR.title")}
    />
  );

  return {
    data,
    renderItem,
    refreshControlProps,
    ListFooterComponent: <></>,
    ListEmptyComponent,
    skeleton: <CgnMerchantListSkeleton count={10} hasIcons />
  };
};

import {
  Badge,
  H6,
  HSpacer,
  IOStyles,
  ListItemNav
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
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
import I18n from "../../../../../i18n";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
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
import { CgnMerchantListSkeleton } from "../../components/merchants/CgnMerchantListSkeleton";

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

  const renderItem = (item: MerchantsAll) => (
    <ListItemNav
      key={item.id}
      onPress={() => onItemPress(item.id)}
      value={
        <View style={IOStyles.rowSpaceBetween}>
          <H6 style={{ flexGrow: 1, flexShrink: 1 }}>{item.name}</H6>
          <HSpacer />
          {item.newDiscounts && (
            <View style={[IOStyles.rowSpaceBetween, IOStyles.alignCenter]}>
              <Badge
                variant="cgn"
                text={
                  item?.numberOfNewDiscounts
                    ? item.numberOfNewDiscounts.toString()
                    : I18n.t("bonus.cgn.merchantsList.news")
                }
              />
            </View>
          )}
        </View>
      }
      accessibilityLabel={item?.name}
    />
  );

  const refreshControlProps = {
    refreshing: isLoading(onlineMerchants) || isLoading(offlineMerchants),
    onRefresh: initLoadingLists
  };

  const ListEmptyComponent = (
    <OperationResultScreenContent
      title={I18n.t("wallet.payment.outcome.GENERIC_ERROR.title")}
      pictogram="umbrella"
      action={{
        label: I18n.t("global.buttons.retry"),
        onPress: initLoadingLists
      }}
    />
  );

  return {
    data,
    renderItem,
    refreshControlProps,
    ListFooterComponent: <></>,
    ListEmptyComponent,
    skeleton: <CgnMerchantListSkeleton hasIcons count={10} />
  };
};

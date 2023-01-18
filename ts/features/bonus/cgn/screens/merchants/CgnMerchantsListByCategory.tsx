import { Route, useNavigation, useRoute } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { useMemo } from "react";
import { View, SafeAreaView, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Merchant } from "../../../../../../definitions/cgn/merchants/Merchant";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import GenericErrorComponent from "../../../../../components/screens/GenericErrorComponent";
import I18n from "../../../../../i18n";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import {
  getValueOrElse,
  isError,
  isLoading
} from "../../../bpd/model/RemoteValue";
import CgnMerchantsListView from "../../components/merchants/CgnMerchantsListView";
import { CgnDetailsParamsList } from "../../navigation/params";
import CGN_ROUTES from "../../navigation/routes";
import {
  cgnOfflineMerchants,
  cgnOnlineMerchants
} from "../../store/actions/merchants";
import {
  cgnOfflineMerchantsSelector,
  cgnOnlineMerchantsSelector
} from "../../store/reducers/merchants";
import { CATEGORY_GRADIENT_ANGLE, getCategorySpecs } from "../../utils/filters";
import { mixAndSortMerchants } from "../../utils/merchants";
import { ProductCategoryEnum } from "../../../../../../definitions/cgn/merchants/ProductCategory";

export type CgnMerchantListByCategoryScreenNavigationParams = Readonly<{
  category: ProductCategoryEnum;
}>;

const styles = StyleSheet.create({
  listContainer: {
    paddingTop: 5,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: IOColors.white,
    top: -20
  }
});

const CgnMerchantsListByCategory = () => {
  const dispatch = useIODispatch();
  const route =
    useRoute<
      Route<
        "CGN_MERCHANTS_LIST_BY_CATEGORY",
        CgnMerchantListByCategoryScreenNavigationParams
      >
    >();
  const onlineMerchants = useIOSelector(cgnOnlineMerchantsSelector);
  const offlineMerchants = useIOSelector(cgnOfflineMerchantsSelector);

  const categorySpecs = useMemo(
    () => pipe(route.params.category, getCategorySpecs, O.toUndefined),
    [route]
  );

  const navigation =
    useNavigation<
      IOStackNavigationProp<CgnDetailsParamsList, "CGN_MERCHANTS_CATEGORIES">
    >();

  const categoryFilter = useMemo(
    () =>
      route.params.category
        ? {
            productCategories: [route.params.category]
          }
        : {},
    [route]
  );

  const initLoadingLists = () => {
    dispatch(cgnOfflineMerchants.request(categoryFilter));
    dispatch(cgnOnlineMerchants.request(categoryFilter));
  };

  React.useEffect(initLoadingLists, [route, categoryFilter, dispatch]);

  // Mixes online and offline merchants to render on the same list
  // merchants are sorted by name
  const merchantsAll = useMemo(
    () =>
      mixAndSortMerchants(
        getValueOrElse(onlineMerchants, []),
        getValueOrElse(offlineMerchants, [])
      ),
    [onlineMerchants, offlineMerchants]
  );

  const onItemPress = (id: Merchant["id"]) => {
    navigation.navigate(CGN_ROUTES.DETAILS.MERCHANTS.DETAIL, {
      merchantID: id
    });
  };

  return (
    <BaseScreenComponent
      goBack
      headerTitle={I18n.t(
        pipe(
          categorySpecs,
          O.fromNullable,
          O.fold(
            () => "bonus.cgn.merchantsList.navigationTitle",
            cs => cs.nameKey
          )
        )
      )}
      contextualHelp={emptyContextualHelp}
    >
      {categorySpecs && (
        <LinearGradient
          useAngle={true}
          angle={CATEGORY_GRADIENT_ANGLE}
          colors={categorySpecs.colors}
          style={[
            IOStyles.horizontalContentPadding,
            {
              paddingTop: 16,
              paddingBottom: 32
            }
          ]}
        >
          <View style={[IOStyles.row, { alignItems: "center" }]}>
            <H1 color={"white"} style={[IOStyles.flex, { paddingRight: 30 }]}>
              {I18n.t(categorySpecs.nameKey)}
            </H1>
            {categorySpecs.icon({
              width: 57,
              height: 57,
              fill: IOColors.white,
              style: { justifyContent: "flex-end" }
            })}
          </View>
        </LinearGradient>
      )}
      {isError(onlineMerchants) && isError(offlineMerchants) ? (
        <SafeAreaView style={IOStyles.flex}>
          <GenericErrorComponent onRetry={initLoadingLists} />
        </SafeAreaView>
      ) : (
        <View style={[IOStyles.flex, styles.listContainer]}>
          <CgnMerchantsListView
            merchantList={merchantsAll}
            onItemPress={onItemPress}
            onRefresh={initLoadingLists}
            refreshing={
              isLoading(onlineMerchants) || isLoading(offlineMerchants)
            }
          />
        </View>
      )}
    </BaseScreenComponent>
  );
};

export default CgnMerchantsListByCategory;

import {
  ContentWrapper,
  Divider,
  H3,
  HSpacer,
  IOColors,
  IOVisualCostants,
  Icon,
  hexToRgba
} from "@pagopa/io-app-design-system";
import { Route, useNavigation, useRoute } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform, RefreshControl, View } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import I18n from "i18next";
import { Merchant } from "../../../../../../definitions/cgn/merchants/Merchant";
import { ProductCategoryEnum } from "../../../../../../definitions/cgn/merchants/ProductCategory";
import {
  getValueOrElse,
  isError,
  isLoading
} from "../../../../../common/model/RemoteValue";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import FocusAwareStatusBar from "../../../../../components/ui/FocusAwareStatusBar";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { CgnMerchantListSkeleton } from "../../components/merchants/CgnMerchantListSkeleton";
import { CgnMerchantListViewRenderItem } from "../../components/merchants/CgnMerchantsListView";
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
import { getCategorySpecs } from "../../utils/filters";
import { mixAndSortMerchants } from "../../utils/merchants";

export type CgnMerchantListByCategoryScreenNavigationParams = Readonly<{
  category: ProductCategoryEnum;
}>;

const CgnMerchantsListByCategory = () => {
  const animatedFlatListRef = useAnimatedRef<Animated.FlatList<any>>();

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

  const { navigate } =
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

  const [isPullRefresh, setIsPullRefresh] = useState(false);

  const initLoadingLists = () => {
    dispatch(cgnOfflineMerchants.request(categoryFilter));
    dispatch(cgnOnlineMerchants.request(categoryFilter));
    setIsPullRefresh(false);
  };

  useEffect(initLoadingLists, [route, categoryFilter, dispatch]);

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

  const onItemPress = useCallback(
    (id: Merchant["id"]) => {
      navigate(CGN_ROUTES.DETAILS.MERCHANTS.DETAIL, {
        merchantID: id
      });
    },
    [navigate]
  );

  useHeaderSecondLevel({
    title: I18n.t(
      pipe(
        categorySpecs,
        O.fromNullable,
        O.fold(
          () => "bonus.cgn.merchantsList.navigationTitle",
          cs => cs.nameKey as any
        )
      )
    ),
    enableDiscreteTransition: true,
    animatedRef: animatedFlatListRef,
    backgroundColor: categorySpecs?.colors,
    variant: categorySpecs?.headerVariant,
    supportRequest: true,
    secondAction: {
      icon: "search",
      onPress() {
        navigate(CGN_ROUTES.DETAILS.MERCHANTS.SEARCH);
      },
      accessibilityLabel: I18n.t(
        "bonus.cgn.merchantSearch.goToSearchAccessibilityLabel"
      )
    }
  });

  const renderItem = useMemo(
    () =>
      CgnMerchantListViewRenderItem({
        onItemPress,
        count: merchantsAll.length
      }),
    [merchantsAll.length, onItemPress]
  );

  const isListLoading =
    isLoading(onlineMerchants) || isLoading(offlineMerchants);

  const isListRefreshing = isListLoading && isPullRefresh;

  const header = () => (
    <>
      {Platform.OS === "ios" && (
        <View
          style={{
            position: "absolute",
            height: 1000,
            backgroundColor: categorySpecs?.colors,
            top: -1000,
            right: 0,
            left: 0
          }}
        />
      )}
      {categorySpecs && (
        <ContentWrapper
          style={{
            backgroundColor: categorySpecs.colors,
            paddingBottom: 24
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: hexToRgba(IOColors.white, 0.2),
                height: 66,
                width: 66,
                borderRadius: 8
              }}
            >
              <Icon
                name={categorySpecs.icon}
                size={32}
                color={categorySpecs.textColor}
              />
            </View>
            <HSpacer size={16} />
            <View style={{ flex: 1 }}>
              <H3 color={categorySpecs.textColor}>
                {I18n.t(categorySpecs.nameKey as any)}
              </H3>
            </View>
          </View>
        </ContentWrapper>
      )}
    </>
  );
  const refreshControl = (
    <RefreshControl
      style={{ zIndex: 1 }}
      tintColor={IOColors[categorySpecs?.textColor ?? "black"]}
      refreshing={isListRefreshing}
      onRefresh={() => {
        initLoadingLists();
        setIsPullRefresh(true);
      }}
    />
  );

  return (
    <>
      <FocusAwareStatusBar
        animated
        backgroundColor={categorySpecs?.colors}
        barStyle={categorySpecs?.statusBarStyle}
      />
      {isError(onlineMerchants) && isError(offlineMerchants) ? (
        <OperationResultScreenContent
          enableAnimatedPictogram
          pictogram="umbrella"
          title={I18n.t("wallet.errors.GENERIC_ERROR")}
          subtitle={I18n.t("wallet.errorTransaction.submitBugText")}
          action={{
            label: I18n.t("global.buttons.retry"),
            accessibilityLabel: I18n.t("global.buttons.retry"),
            onPress: initLoadingLists
          }}
          loop
        />
      ) : (
        <Animated.FlatList
          ref={animatedFlatListRef}
          style={{ flexGrow: 1 }}
          scrollEventThrottle={8}
          snapToEnd={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: IOVisualCostants.appMarginDefault
          }}
          refreshControl={refreshControl}
          data={merchantsAll}
          keyExtractor={item => item.id}
          ListEmptyComponent={CgnMerchantListSkeleton}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <Divider />}
          ListHeaderComponent={header}
        />
      )}
    </>
  );
};

export default CgnMerchantsListByCategory;

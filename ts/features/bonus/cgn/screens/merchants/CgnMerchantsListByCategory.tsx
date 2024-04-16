import { Route, useNavigation, useRoute } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { useMemo } from "react";
import { View, LayoutChangeEvent, RefreshControl } from "react-native";
import {
  H3,
  HSpacer,
  IOColors,
  Icon,
  VSpacer,
  hexToRgba
} from "@pagopa/io-app-design-system";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
import { Merchant } from "../../../../../../definitions/cgn/merchants/Merchant";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import GenericErrorComponent from "../../../../../components/screens/GenericErrorComponent";
import I18n from "../../../../../i18n";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import {
  getValueOrElse,
  isError,
  isLoading
} from "../../../../../common/model/RemoteValue";
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
import { ProductCategoryEnum } from "../../../../../../definitions/cgn/merchants/ProductCategory";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import FocusAwareStatusBar from "../../../../../components/ui/FocusAwareStatusBar";
import CgnMerchantsListView from "../../components/merchants/CgnMerchantsListView";

export type CgnMerchantListByCategoryScreenNavigationParams = Readonly<{
  category: ProductCategoryEnum;
}>;

const CgnMerchantsListByCategory = () => {
  const [titleHeight, setTitleHeight] = React.useState(0);
  const translationY = useSharedValue(0);

  const getTitleHeight = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (titleHeight === 0) {
      setTitleHeight(height);
    }
  };

  const scrollHandler = useAnimatedScrollHandler(event => {
    // eslint-disable-next-line functional/immutable-data
    translationY.value = event.contentOffset.y;
  });
  const insets = useSafeAreaInsets();
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

  useHeaderSecondLevel({
    title: I18n.t(
      pipe(
        categorySpecs,
        O.fromNullable,
        O.fold(
          () => "bonus.cgn.merchantsList.navigationTitle",
          cs => cs.nameKey
        )
      )
    ),
    scrollValues: {
      contentOffsetY: translationY,
      triggerOffset: titleHeight
    },
    transparent: true,
    canGoBack: true,
    supportRequest: true
  });

  return (
    <>
      <FocusAwareStatusBar
        backgroundColor={categorySpecs?.colors}
        barStyle={"dark-content"}
      />
      {isError(onlineMerchants) && isError(offlineMerchants) ? (
        <GenericErrorComponent onRetry={initLoadingLists} />
      ) : (
        <Animated.ScrollView
          style={{ flexGrow: 1 }}
          onScroll={scrollHandler}
          scrollEventThrottle={8}
          snapToOffsets={[0, titleHeight]}
          refreshControl={
            <RefreshControl
              refreshing={
                isLoading(onlineMerchants) || isLoading(offlineMerchants)
              }
              onRefresh={initLoadingLists}
            />
          }
        >
          {categorySpecs && (
            <View
              onLayout={getTitleHeight}
              style={[
                IOStyles.horizontalContentPadding,
                {
                  paddingTop: insets.top,
                  backgroundColor: categorySpecs.colors,
                  paddingBottom: 24
                }
              ]}
            >
              <VSpacer size={48} />
              <VSpacer size={32} />
              <View style={[IOStyles.row, { alignItems: "center" }]}>
                <View
                  // eslint-disable-next-line react-native/no-color-literals
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
                <H3 color={categorySpecs.textColor}>
                  {I18n.t(categorySpecs.nameKey)}
                </H3>
              </View>
            </View>
          )}
          <CgnMerchantsListView
            merchantList={merchantsAll}
            onItemPress={onItemPress}
          />
        </Animated.ScrollView>
      )}
    </>
  );
};

export default CgnMerchantsListByCategory;

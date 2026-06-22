import {
  Badge,
  Body,
  ContentWrapper,
  Divider,
  H6,
  IOToast,
  ListItemAction,
  ListItemNav,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import I18n from "i18next";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProductCategoryWithNewDiscountsCount } from "../../../../../../definitions/cgn/merchants/ProductCategoryWithNewDiscountsCount";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { cgnMerchantsModalSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { getListItemAccessibilityLabelCount } from "../../../../../utils/accessibility";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { CgnDetailsParamsList } from "../../navigation/params";
import CGN_ROUTES from "../../navigation/routes";
import { cgnCategories } from "../../store/actions/categories";
import { cgnCategoriesListSelector } from "../../store/reducers/categories";
import { getCategorySpecs } from "../../utils/filters";

export const CgnMerchantCategoriesListScreen = () => {
  const theme = useIOTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useIODispatch();
  const [isPullRefresh, setIsPullRefresh] = useState(false);
  const potCategories = useIOSelector(cgnCategoriesListSelector);

  const showSortingInfo = useIOSelector(cgnMerchantsModalSelector);

  const navigation =
    useNavigation<
      IOStackNavigationProp<CgnDetailsParamsList, "CGN_MERCHANTS_CATEGORIES">
    >();

  const { present, bottomSheet } = useIOBottomSheetModal({
    title: I18n.t("bonus.cgn.merchantsList.categoriesList.bottomSheet.title"),
    component: (
      <View style={{ paddingBottom: insets.bottom }}>
        <Body>
          {I18n.t("bonus.cgn.merchantsList.categoriesList.bottomSheet.content")}
        </Body>
      </View>
    )
  });

  const loadCategories = () => {
    dispatch(cgnCategories.request());
  };

  const onPullRefresh = () => {
    setIsPullRefresh(true);
    dispatch(cgnCategories.request());
  };

  useEffect(loadCategories, [dispatch]);

  const isError = useMemo(() => pot.isError(potCategories), [potCategories]);

  useEffect(() => {
    if (isError) {
      IOToast.error(I18n.t("global.genericError"));
    }
  }, [isError]);

  useEffect(() => {
    if (pot.isSome(potCategories) && !pot.isLoading(potCategories)) {
      setIsPullRefresh(false);
    }
  }, [potCategories]);

  const renderItem = (
    category: ProductCategoryWithNewDiscountsCount,
    index: number
  ) => {
    const specsOption = getCategorySpecs(category.productCategory);
    if (!("value" in specsOption)) {
      return null;
    }

    const s = specsOption.value;
    const countAvailable = category.newDiscounts > 0;

    const accessibilityLabel =
      (countAvailable
        ? `${I18n.t(s.nameKey)} ${I18n.t("bonus.cgn.merchantsList.news")}`
        : `${I18n.t(s.nameKey)}`) +
      getListItemAccessibilityLabelCount(categoriesToArray.length, index);

    return (
      <ContentWrapper key={category.productCategory}>
        <ListItemNav
          value={
            countAvailable ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <H6>{I18n.t(s.nameKey)}</H6>
                <Badge
                  accessible={false}
                  text={I18n.t("bonus.cgn.merchantsList.news")}
                  variant="cgn"
                />
              </View>
            ) : (
              I18n.t(s.nameKey)
            )
          }
          accessibilityLabel={accessibilityLabel}
          onPress={() => {
            navigation.navigate(CGN_ROUTES.DETAILS.MERCHANTS.LIST_BY_CATEGORY, {
              category: s.type
            });
          }}
          iconColor={theme["icon-decorative"]}
          icon={s.icon}
        />
      </ContentWrapper>
    );
  };

  const categoriesToArray: ReadonlyArray<ProductCategoryWithNewDiscountsCount> =
    useMemo(
      () => [...(pot.isSome(potCategories) ? potCategories.value : [])],
      [potCategories]
    );

  return {
    data: categoriesToArray,
    renderItem,
    refreshControlProps: {
      refreshing: isPullRefresh,
      onRefresh: onPullRefresh
    },
    ListFooterComponent: showSortingInfo ? (
      <ContentWrapper>
        <Divider />
        <ListItemAction
          onPress={present}
          accessibilityLabel={I18n.t(
            "bonus.cgn.merchantsList.categoriesList.bottomSheet.cta"
          )}
          label={I18n.t(
            "bonus.cgn.merchantsList.categoriesList.bottomSheet.cta"
          )}
          variant="primary"
        />
        {bottomSheet}
      </ContentWrapper>
    ) : undefined,
    ListEmptyComponent: undefined
  };
};

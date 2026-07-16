import {
  Body,
  ContentWrapper,
  Divider,
  HSpacer,
  IOToast,
  ListItemAction,
  VSpacer
} from "@io-app/design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import I18n from "i18next";
import { Fragment, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProductCategoryWithNewDiscountsCount } from "../../../../../../definitions/cgn/merchants/ProductCategoryWithNewDiscountsCount";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { cgnMerchantsModalSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { getListItemAccessibilityLabelCount } from "../../../../../utils/accessibility";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { CgnMerchantCard } from "../../components/merchants/CgnMerchantCard";
import { CgnDetailsParamsList } from "../../navigation/params";
import CGN_ROUTES from "../../navigation/routes";
import { cgnCategories } from "../../store/actions/categories";
import { cgnCategoriesListSelector } from "../../store/reducers/categories";
import { getCategorySpecs } from "../../utils/filters";

type CategoryRow = {
  categories: ReadonlyArray<RenderableCategory>;
  id: string;
};

type CategorySpecs = Extract<
  ReturnType<typeof getCategorySpecs>,
  { value: unknown }
>["value"];

type RenderableCategory = {
  category: ProductCategoryWithNewDiscountsCount;
  specs: CategorySpecs;
};

const CATEGORY_CARDS_PER_ROW = 2;

const getRenderableCategories = (
  categories: ReadonlyArray<ProductCategoryWithNewDiscountsCount>
): ReadonlyArray<RenderableCategory> =>
  categories.flatMap(category => {
    const specsOption = getCategorySpecs(category.productCategory);

    return "value" in specsOption
      ? [{ category, specs: specsOption.value }]
      : [];
  });

const getCategoryRows = (
  categories: ReadonlyArray<RenderableCategory>
): ReadonlyArray<CategoryRow> =>
  categories.reduce<ReadonlyArray<CategoryRow>>((rows, renderable, index) => {
    // Keep the two-column layout local to this screen: the parent FlatList is shared
    // with the merchants tab, so using numColumns={2} would force the container to
    // remount or specialize the list whenever the selected tab changes.
    if (index % CATEGORY_CARDS_PER_ROW !== 0) {
      return rows;
    }

    return [
      ...rows,
      {
        categories: categories.slice(index, index + CATEGORY_CARDS_PER_ROW),
        id: `category-row-${renderable.category.productCategory}`
      }
    ];
  }, []);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row"
  },
  cardWrapper: {
    flex: 1
  }
});

export const CgnMerchantCategoriesListScreen = () => {
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

  const renderCategoryCard = (
    renderable: RenderableCategory,
    index: number,
    totalCategories: number
  ) => {
    const { category, specs } = renderable;
    const countAvailable = category.newDiscounts > 0;

    const accessibilityLabel =
      (countAvailable
        ? `${I18n.t(specs.nameKey)} ${I18n.t("bonus.cgn.merchantsList.news")}`
        : `${I18n.t(specs.nameKey)}`) +
      getListItemAccessibilityLabelCount(totalCategories, index);

    return (
      <CgnMerchantCard
        accessibilityLabel={accessibilityLabel}
        icon={specs.icon}
        iconBackgroundColor={specs.colors}
        iconColor={specs.textColor}
        isNew={countAvailable}
        name={I18n.t(specs.nameKey)}
        onPress={() => {
          navigation.navigate(CGN_ROUTES.DETAILS.MERCHANTS.LIST_BY_CATEGORY, {
            category: specs.type
          });
        }}
        testID={`cgn-category-card-${category.productCategory}`}
      />
    );
  };

  const categoriesToArray: ReadonlyArray<ProductCategoryWithNewDiscountsCount> =
    useMemo(
      () => [...(pot.isSome(potCategories) ? potCategories.value : [])],
      [potCategories]
    );
  const renderableCategories = useMemo(
    () => getRenderableCategories(categoriesToArray),
    [categoriesToArray]
  );
  const renderCategoryRow = (categoryRow: CategoryRow, index: number) => (
    <ContentWrapper key={categoryRow.id}>
      <View style={styles.row}>
        {categoryRow.categories.map((renderable, columnIndex) => (
          <Fragment key={renderable.category.productCategory}>
            {columnIndex > 0 && <HSpacer size={16} />}
            <View style={styles.cardWrapper}>
              {renderCategoryCard(
                renderable,
                index * CATEGORY_CARDS_PER_ROW + columnIndex,
                renderableCategories.length
              )}
            </View>
          </Fragment>
        ))}
        {categoryRow.categories.length === 1 && (
          <>
            <HSpacer size={16} />
            <View style={styles.cardWrapper} />
          </>
        )}
      </View>
    </ContentWrapper>
  );

  const categoriesRows = useMemo(
    () => getCategoryRows(renderableCategories),
    [renderableCategories]
  );

  return {
    data: categoriesRows,
    renderItem: renderCategoryRow,
    ItemSeparatorComponent: () => <VSpacer size={16} />,
    refreshControlProps: {
      refreshing: isPullRefresh,
      onRefresh: onPullRefresh
    },
    ListFooterComponent: showSortingInfo ? (
      <ContentWrapper>
        <Divider />
        <ListItemAction
          accessibilityLabel={I18n.t(
            "bonus.cgn.merchantsList.categoriesList.bottomSheet.cta"
          )}
          label={I18n.t(
            "bonus.cgn.merchantsList.categoriesList.bottomSheet.cta"
          )}
          onPress={present}
          variant="primary"
        />
        {bottomSheet}
      </ContentWrapper>
    ) : undefined,
    ListEmptyComponent: undefined
  };
};

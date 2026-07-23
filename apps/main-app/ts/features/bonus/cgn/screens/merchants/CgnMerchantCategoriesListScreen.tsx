import {
  Body,
  ContentWrapper,
  Divider,
  HSpacer,
  IOSkeleton,
  IOSpacingScale,
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
import { CgnMerchantCategoriesSocialLinks } from "../../components/merchants/CgnMerchantCategoriesSocialLinks";
import { CgnDetailsParamsList } from "../../navigation/params";
import CGN_ROUTES from "../../navigation/routes";
import { cgnCategories } from "../../store/actions/categories";
import { cgnCategoriesListSelector } from "../../store/reducers/categories";
import { getCategorySpecs } from "../../utils/filters";

export type CategoryRow = {
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
const CATEGORY_CARD_SPACING: IOSpacingScale = 8;
const CATEGORY_LIST_BOTTOM_SPACING: IOSpacingScale = 32;
const CATEGORY_CARD_SKELETON_ROWS = 3;
const CATEGORY_CARD_SKELETON_HEIGHT = 116;
const CATEGORY_CARD_SKELETON_RADIUS = 8;

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
): ReadonlyArray<CategoryRow> => {
  const rowsCount = Math.ceil(categories.length / CATEGORY_CARDS_PER_ROW);

  return Array.from({ length: rowsCount }, (_, rowIndex) => {
    const startIndex = rowIndex * CATEGORY_CARDS_PER_ROW;
    const rowCategories = categories.slice(
      startIndex,
      startIndex + CATEGORY_CARDS_PER_ROW
    );
    const firstCategory = rowCategories[0];

    // Keep the two-column layout local to this screen: the parent FlatList is shared
    // with the merchants tab, so using numColumns={2} would force the container to
    // remount or specialize the list whenever the selected tab changes.
    return {
      categories: rowCategories,
      id: `category-row-${firstCategory.category.productCategory}`
    };
  });
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row"
  },
  cardWrapper: {
    flex: 1
  },
  footer: {
    flexGrow: 1
  }
});

const CgnMerchantCategoryCardsSkeleton = () => (
  <View testID="CgnMerchantCategoryCardsSkeleton">
    {new Array(CATEGORY_CARD_SKELETON_ROWS).fill(null).map((_, rowIndex) => (
      <ContentWrapper key={rowIndex}>
        <View style={styles.row}>
          {new Array(CATEGORY_CARDS_PER_ROW)
            .fill(null)
            .map((__, columnIndex) => (
              <Fragment key={columnIndex}>
                {columnIndex > 0 && <HSpacer size={CATEGORY_CARD_SPACING} />}
                <View style={styles.cardWrapper}>
                  <IOSkeleton
                    height={CATEGORY_CARD_SKELETON_HEIGHT}
                    radius={CATEGORY_CARD_SKELETON_RADIUS}
                    shape="rectangle"
                    testID={`CgnMerchantCategoryCardsSkeleton-Item-${rowIndex}-${columnIndex}`}
                    width="100%"
                  />
                </View>
              </Fragment>
            ))}
        </View>
        {rowIndex < CATEGORY_CARD_SKELETON_ROWS - 1 && (
          <VSpacer size={CATEGORY_CARD_SPACING} />
        )}
      </ContentWrapper>
    ))}
  </View>
);

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
        backgroundColor={specs.colors}
        icon={specs.icon}
        isNew={countAvailable}
        name={I18n.t(specs.nameKey)}
        onPress={() => {
          navigation.navigate(CGN_ROUTES.DETAILS.MERCHANTS.LIST_BY_CATEGORY, {
            category: specs.type
          });
        }}
        testID={`cgn-category-card-${category.productCategory}`}
        textColor={specs.textColor}
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
  const categoriesRows = useMemo(
    () => getCategoryRows(renderableCategories),
    [renderableCategories]
  );
  const renderCategoryRow = (categoryRow: CategoryRow, index: number) => (
    <>
      <ContentWrapper key={categoryRow.id}>
        <View style={styles.row}>
          {categoryRow.categories.map((renderable, columnIndex) => (
            <Fragment key={renderable.category.productCategory}>
              {columnIndex > 0 && <HSpacer size={CATEGORY_CARD_SPACING} />}
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
              <HSpacer size={CATEGORY_CARD_SPACING} />
              <View style={styles.cardWrapper} />
            </>
          )}
        </View>
      </ContentWrapper>
      {index < categoriesRows.length - 1 && (
        <VSpacer size={CATEGORY_CARD_SPACING} />
      )}
    </>
  );

  const ListFooterComponent = (
    <>
      {renderableCategories.length > 0 && (
        <>
          <VSpacer size={CATEGORY_LIST_BOTTOM_SPACING} />
          <CgnMerchantCategoriesSocialLinks />
        </>
      )}
      {showSortingInfo && (
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
      )}
    </>
  );

  return {
    data: categoriesRows,
    renderItem: renderCategoryRow,
    ItemSeparatorComponent: undefined,
    refreshControlProps: {
      refreshing: isPullRefresh,
      onRefresh: onPullRefresh
    },
    ListFooterComponent,
    ListFooterComponentStyle:
      renderableCategories.length > 0 ? styles.footer : undefined,
    ListEmptyComponent: isError ? undefined : (
      <CgnMerchantCategoryCardsSkeleton />
    )
  };
};

import {
  Badge,
  Body,
  Divider,
  H6,
  IOStyles,
  IOToast,
  ListItemAction,
  ListItemNav
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useState, useEffect, useMemo } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProductCategoryWithNewDiscountsCount } from "../../../../../../definitions/cgn/merchants/ProductCategoryWithNewDiscountsCount";
import I18n from "../../../../../i18n";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../../../store/reducers/persistedPreferences";
import { useIOBottomSheetAutoresizableModal } from "../../../../../utils/hooks/bottomSheet";
import { CgnDetailsParamsList } from "../../navigation/params";
import CGN_ROUTES from "../../navigation/routes";
import { cgnCategories } from "../../store/actions/categories";
import { cgnCategoriesListSelector } from "../../store/reducers/categories";
import { getCategorySpecs } from "../../utils/filters";
import { CgnMerchantListSkeleton } from "../../components/merchants/CgnMerchantListSkeleton";

export const CgnMerchantCategoriesListScreen = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useIODispatch();
  const [isPullRefresh, setIsPullRefresh] = useState(false);
  const potCategories = useIOSelector(cgnCategoriesListSelector);
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  const navigation =
    useNavigation<
      IOStackNavigationProp<CgnDetailsParamsList, "CGN_MERCHANTS_CATEGORIES">
    >();

  const { present, bottomSheet } = useIOBottomSheetAutoresizableModal({
    fullScreen: true,
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

  const renderCategoryElement = (
    category: ProductCategoryWithNewDiscountsCount,
    i: number
  ) => {
    const specs = getCategorySpecs(category.productCategory);
    const countAvailable = category.newDiscounts > 0;
    return pipe(
      specs,
      O.fold(
        () => null,
        s => (
          <ListItemNav
            key={i}
            value={
              countAvailable ? (
                <View style={IOStyles.rowSpaceBetween}>
                  <H6>{I18n.t(s.nameKey)}</H6>
                  <Badge text={`${category.newDiscounts}`} variant="purple" />
                </View>
              ) : (
                I18n.t(s.nameKey)
              )
            }
            accessibilityLabel={I18n.t(s.nameKey)}
            onPress={() => {
              navigation.navigate(
                CGN_ROUTES.DETAILS.MERCHANTS.LIST_BY_CATEGORY,
                {
                  category: s.type
                }
              );
            }}
            iconColor="grey-300"
            icon={s.icon}
          />
        )
      )
    );
  };

  const categoriesToArray: ReadonlyArray<ProductCategoryWithNewDiscountsCount> =
    useMemo(
      () => [...(pot.isSome(potCategories) ? potCategories.value : [])],
      [potCategories]
    );

  return (
    <>
      {bottomSheet}
      <FlatList
        ListEmptyComponent={() => <CgnMerchantListSkeleton hasIcons />}
        data={pot.isNone(potCategories) ? [] : categoriesToArray}
        style={[
          IOStyles.horizontalContentPadding,
          IOStyles.flex,
          { paddingBottom: insets.bottom }
        ]}
        keyExtractor={pc => pc.productCategory}
        renderItem={({ item, index }) => renderCategoryElement(item, index)}
        refreshControl={
          <RefreshControl
            refreshing={isPullRefresh}
            onRefresh={onPullRefresh}
          />
        }
        ItemSeparatorComponent={() => <Divider />}
        ListFooterComponent={
          isDesignSystemEnabled ? (
            <>
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
            </>
          ) : null
        }
      />
    </>
  );
};

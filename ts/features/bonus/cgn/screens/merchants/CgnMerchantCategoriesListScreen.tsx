import {
  Badge,
  Body,
  Divider,
  H6,
  IOToast,
  ListItemAction,
  ListItemNav
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProductCategoryWithNewDiscountsCount } from "../../../../../../definitions/cgn/merchants/ProductCategoryWithNewDiscountsCount";
import I18n from "../../../../../i18n";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { useIOBottomSheetAutoresizableModal } from "../../../../../utils/hooks/bottomSheet";
import { CgnMerchantListSkeleton } from "../../components/merchants/CgnMerchantListSkeleton";
import { CgnDetailsParamsList } from "../../navigation/params";
import CGN_ROUTES from "../../navigation/routes";
import { cgnCategories } from "../../store/actions/categories";
import { cgnCategoriesListSelector } from "../../store/reducers/categories";
import { getCategorySpecs } from "../../utils/filters";

export const CgnMerchantCategoriesListScreen = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useIODispatch();
  const [isPullRefresh, setIsPullRefresh] = useState(false);
  const potCategories = useIOSelector(cgnCategoriesListSelector);

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

  const renderItem = (
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
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <H6>{I18n.t(s.nameKey)}</H6>
                  <Badge text={`${category?.newDiscounts}`} variant="cgn" />
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

  return {
    data: categoriesToArray,
    renderItem,
    refreshControlProps: {
      refreshing: isPullRefresh,
      onRefresh: onPullRefresh
    },
    ListFooterComponent: (
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
        {bottomSheet}
      </>
    ),
    ListEmptyComponent: undefined,
    skeleton: <CgnMerchantListSkeleton hasIcons count={10} />
  };
};

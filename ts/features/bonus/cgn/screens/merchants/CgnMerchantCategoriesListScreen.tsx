import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  Badge,
  Body,
  H6,
  IOStyles,
  IOToast,
  ListItemAction,
  ListItemNav
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProductCategoryWithNewDiscountsCount } from "../../../../../../definitions/cgn/merchants/ProductCategoryWithNewDiscountsCount";
import { getCategorySpecs } from "../../utils/filters";
import I18n from "../../../../../i18n";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { CgnDetailsParamsList } from "../../navigation/params";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { cgnCategoriesListSelector } from "../../store/reducers/categories";
import { cgnCategories } from "../../store/actions/categories";
import CGN_ROUTES from "../../navigation/routes";
import { useIOBottomSheetAutoresizableModal } from "../../../../../utils/hooks/bottomSheet";

export const CgnMerchantCategoriesListScreen = () => {
  const insets = useSafeAreaInsets();
  const isFirstRender = React.useRef<boolean>(true);
  const dispatch = useIODispatch();
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
  React.useEffect(loadCategories, [dispatch]);

  const isError = React.useMemo(
    () => pot.isError(potCategories),
    [potCategories]
  );

  React.useEffect(() => {
    if (!isFirstRender.current && isError) {
      IOToast.error(I18n.t("global.genericError"));
    }
    // eslint-disable-next-line functional/immutable-data
    isFirstRender.current = false;
  }, [isError]);

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
            icon={s.icon}
          />
        )
      )
    );
  };

  const categoriesToArray: ReadonlyArray<ProductCategoryWithNewDiscountsCount> =
    React.useMemo(
      () => [...(pot.isSome(potCategories) ? potCategories.value : [])],
      [potCategories]
    );

  return (
    <>
      {bottomSheet}
      <FlatList
        data={categoriesToArray}
        style={[
          IOStyles.horizontalContentPadding,
          IOStyles.flex,
          { paddingBottom: insets.bottom }
        ]}
        keyExtractor={pc => pc.productCategory}
        renderItem={({ item, index }) => renderCategoryElement(item, index)}
        refreshControl={
          <RefreshControl
            refreshing={pot.isLoading(potCategories)}
            onRefresh={loadCategories}
          />
        }
        ListFooterComponent={
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
        }
      />
    </>
  );
};

import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import { View } from "native-base";
import * as React from "react";
import { useEffect, useMemo, useRef } from "react";
import { FlatList, ListRenderItemInfo, Platform } from "react-native";
import { ProductCategoryEnum } from "../../../../../../definitions/cgn/merchants/ProductCategory";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../../../../components/screens/EdgeBorderComponent";
import I18n from "../../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { showToast } from "../../../../../utils/showToast";
import CgnMerchantCategoryItem from "../../components/merchants/CgnMerchantCategoryItem";
import CGN_ROUTES from "../../navigation/routes";
import {
  cgnCategories,
  cgnSelectedCategory
} from "../../store/actions/categories";
import { cgnCategoriesListSelector } from "../../store/reducers/categories";
import { getCategorySpecs } from "../../utils/filters";

const CgnMerchantsCategoriesSelectionScreen = () => {
  const isFirstRender = useRef<boolean>(true);
  const dispatch = useIODispatch();
  const potCategories = useIOSelector(cgnCategoriesListSelector);
  const navigation = useNavigation();

  const loadCategories = () => {
    dispatch(cgnCategories.request());
  };

  useEffect(loadCategories, [dispatch]);

  const isError = useMemo(() => pot.isError(potCategories), [potCategories]);

  useEffect(() => {
    if (!isFirstRender.current && isError) {
      showToast(I18n.t("global.genericError"), "danger");
    }
    // eslint-disable-next-line functional/immutable-data
    isFirstRender.current = false;
  }, [isError]);

  const renderCategoryElement = (
    info: ListRenderItemInfo<ProductCategoryEnum | "All">
  ) => {
    if (info.item === "All") {
      return (
        <CgnMerchantCategoryItem
          title={I18n.t("bonus.cgn.merchantDetail.categories.all")}
          colors={["#475A6D", "#E6E9F2"]}
          onPress={() => navigation.navigate(CGN_ROUTES.DETAILS.MERCHANTS.LIST)}
        />
      );
    }
    const specs = getCategorySpecs(info.item);

    return specs.fold(null, s => {
      const categoryIcon = (
        <View style={[{ alignItems: "flex-end" }]}>
          {s.icon({
            height: 32,
            width: 32,
            fill: IOColors.white,
            style: { justifyContent: "flex-end" }
          })}
        </View>
      );

      return (
        <CgnMerchantCategoryItem
          title={I18n.t(s.nameKey)}
          colors={s.colors}
          onPress={() => {
            dispatch(cgnSelectedCategory(s.type));
            navigation.navigate(CGN_ROUTES.DETAILS.MERCHANTS.LIST_BY_CATEGORY);
          }}
          child={categoryIcon}
        />
      );
    });
  };

  const categoriesToArray: ReadonlyArray<ProductCategoryEnum | "All"> = [
    "All",
    ...(pot.isSome(potCategories) ? potCategories.value : [])
  ];

  return (
    <BaseScreenComponent
      goBack
      headerTitle={I18n.t("bonus.cgn.merchantsList.navigationTitle")}
      contextualHelp={emptyContextualHelp}
    >
      <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
        <H1>{I18n.t("bonus.cgn.merchantsList.categoriesList.title")}</H1>
        <View spacer large />
        <FlatList
          showsVerticalScrollIndicator={Platform.OS !== "ios"}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          style={IOStyles.flex}
          data={categoriesToArray}
          refreshing={pot.isLoading(potCategories)}
          onRefresh={loadCategories}
          renderItem={renderCategoryElement}
          numColumns={2}
          keyExtractor={(item: ProductCategoryEnum | "All") => item}
          ListFooterComponent={<EdgeBorderComponent />}
        />
      </View>
    </BaseScreenComponent>
  );
};

export default CgnMerchantsCategoriesSelectionScreen;
